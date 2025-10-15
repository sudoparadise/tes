(function(){
const COMPLIANCE_INDICATOR = "@";
const DATA_ELEMENT_SEPARATOR = "\n";
const RECORD_SEPARATOR = "\x1e";
const SEGMENT_TERMINATOR = "\r";
const FILE_TYPE = "ANSI ";

function padN(num,len){ let s=String(num); while(s.length<len)s="0"+s; return s }
function headerLength(ver){ return ver<2?19:21 }

function countryDateFormat(country){
const c=(country||'').toUpperCase();
if (["USA","US","UNITED STATES","UNITED STATES OF AMERICA"].includes(c)) return "%m%d%Y";
if (["CANADA","CAN"].includes(c)) return "%Y%m%d";
if (["MEXICO","MEX","MX"].includes(c)) return "%Y%m%d";
return "%m%d%Y";
}
function getDateFormat(aamva_version, country){
return aamva_version<3 ? "%m%d%Y" : countryDateFormat(country);
}
function coerceDate8(input, aamva_version, country){
if (!input) return "";
const fmt = getDateFormat(aamva_version, country);
const raw = String(input).replace(/[^0-9]/g,'');
if (raw.length!==8) return raw;
if (fmt==="%Y%m%d"){
const y=parseInt(raw.slice(0,4),10);
if (y>1900&&y<2100) return raw; // already iso
return raw.slice(4,8)+raw.slice(0,2)+raw.slice(2,4); // mmddyyyy -> yyyymmdd
} else {
const y=parseInt(raw.slice(0,4),10);
if (y>1900&&y<2100) return raw.slice(4,6)+raw.slice(6,8)+raw.slice(0,4);
return raw;
}
}

function validateField(def, value){
if (value==null || String(value).length===0){
return def.required ? ${def.tag} is required : null;
}
if (def.transform) value = def.transform(value);
if (def.validate){
if (def.validate instanceof RegExp){
if (!def.validate.test(String(value))) return ${def.tag} invalid;
} else if (typeof def.validate === 'function'){
if (!def.validate(value)) return ${def.tag} invalid;
}
}
return null;
}

function buildPayload(profile, user, opts){
const aamva = Number(opts.aamvaVersion ?? profile.aamvaVersion ?? 10);
const jv = Number(opts.jurisdictionVersion ?? profile.jurisdictionVersion ?? 1);
const entries = Number(opts.entries ?? 1);
const iin = Number(profile.iin);

text
const subfileBodies = [];
for (const sf of profile.subfiles){
  const lines = [];
  for (const def of sf.fields){
    let val = user[def.tag];
    if (['DBB','DBD','DBA'].includes(def.tag)){
      val = coerceDate8(val, aamva, profile.country);
    }
    const err = validateField(def, val);
    if (err) throw new Error(err);
    if (def.transform) val = def.transform(val);
    if (val!=null && String(val).length>0){
      lines.push(def.tag + String(val));
    }
  }
  const body = sf.type + lines.join(DATA_ELEMENT_SEPARATOR) + SEGMENT_TERMINATOR;
  subfileBodies.push({ type: sf.type, body });
}

const hdrlen = headerLength(aamva);
const designatorsLen = entries * 10;
const headerStart =
  COMPLIANCE_INDICATOR + DATA_ELEMENT_SEPARATOR + RECORD_SEPARATOR + SEGMENT_TERMINATOR +
  FILE_TYPE + padN(iin,6) + padN(aamva,2) +
  (aamva<2 ? padN(entries,2) : padN(jv,2)+padN(entries,2));

let offset = hdrlen + designatorsLen;
const designators = [];
for (const sf of subfileBodies){
  const len = sf.body.length;
  designators.push(sf.type + padN(offset,4) + padN(len,4));
  offset += len;
}

const full = headerStart + designators.join('') + subfileBodies.map(s=>s.body).join('');
return { payload: full };
}

window.AAMVA_BUILDER = { buildPayload, getDateFormat, coerceDate8 };
})();