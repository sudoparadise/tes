window.JURISDICTION_PROFILES = (function(){
const EYES = ["BLK","BLU","BRO","DIC","GRY","GRN","HAZ","MAR","PNK","UNK"];
const HAIR = ["BAL","BLK","BLN","BRO","GRY","RED","SDY","WHI","UNK"];

function req(tag, opts={}){ return { tag, required:true, ...opts } }
function opt(tag, opts={}){ return { tag, required:false, ...opts } }
function upper(v){ return v==null? v : String(v).toUpperCase() }
function digits(len){ return new RegExp('^\d{'+len+'}$') }

const VA = {
id:'VA', label:'Virginia', iin:636000, country:'USA',
aamvaVersion:10, jurisdictionVersion:1, dateFormat:'auto',
realId:{ supported:true, default:'auto', tags:['DDA','DDB','DDC','DDD'] },
subfiles:[{
type:'DL',
fields:[
req('DAQ',{label:'DL Number', transform:upper, validate:/^[A-Z0-9]{3,20}$/}),
req('DCS',{label:'Last', transform:upper}),
req('DAC',{label:'First', transform:upper}),
opt('DAD',{label:'Middle', transform:upper}),
opt('DCU',{label:'Suffix', transform:upper}),
req('DBB',{label:'DOB (8 digits)'}),
req('DBD',{label:'Issue (8 digits)'}),
req('DBA',{label:'Expiry (8 digits)'}),
req('DBC',{label:'Gender', validate:/^(1|2|9)$/}),
req('DAU',{label:'Height Inches (3)', validate:digits(3)}),
req('DAY',{label:'Eye', validate:(v)=>EYES.includes(v)}),
opt('DAZ',{label:'Hair', validate:(v)=>HAIR.includes(v)}),
req('DAG',{label:'Street', transform:upper}),
req('DAI',{label:'City', transform:upper}),
req('DAJ',{label:'State', validate:/^[A-Z]{2}$/}),
req('DAK',{label:'Postal', validate:/^[0-9A-Z]{5,10}$/}),
opt('DCF',{label:'Doc Discriminator', transform:upper}),
req('DCG',{label:'Country', validate:/^(USA|CAN|MEX|PRI|GUM|VIR|ASM|MNP)$/}),
],
}]
};

const CA = {
id:'CA', label:'California', iin:636014, country:'USA',
aamvaVersion:10, jurisdictionVersion:1, dateFormat:'auto',
realId:{ supported:true, default:'auto', tags:['DDA','DDB','DDC','DDD'] },
subfiles:[{
type:'DL',
fields:[
req('DAQ',{label:'DL Number', transform:upper, validate:/^[A-Z0-9]{3,20}$/}),
req('DCS',{label:'Last', transform:upper}),
req('DAC',{label:'First', transform:upper}),
opt('DAD',{label:'Middle', transform:upper}),
opt('DCU',{label:'Suffix', transform:upper}),
req('DBB',{label:'DOB'}),
req('DBD',{label:'Issue'}),
req('DBA',{label:'Expiry'}),
req('DBC',{label:'Gender', validate:/^(1|2|9)$/}),
req('DAU',{label:'Height Inches', validate:digits(3)}),
req('DAY',{label:'Eye', validate:(v)=>EYES.includes(v)}),
opt('DAZ',{label:'Hair', validate:(v)=>HAIR.includes(v)}),
req('DAG',{label:'Street', transform:upper}),
req('DAI',{label:'City', transform:upper}),
req('DAJ',{label:'State', validate:/^[A-Z]{2}$/}),
req('DAK',{label:'Postal', validate:/^[0-9A-Z]{5,10}$/}),
opt('DCF',{label:'Doc Discriminator', transform:upper}),
req('DCG',{label:'Country', validate:/^(USA|CAN|MEX|PRI|GUM|VIR|ASM|MNP)$/}),
],
}]
};

// Add remaining jurisdictions using the same pattern:
// TX, FL, NY, AZ, WA, PA, CO, GA, ... and all states + DC + territories.
const list = [VA, CA];
const map = Object.fromEntries(list.map(p=>[p.id,p]));
return { list, map };
})();