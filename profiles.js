window.JURISDICTION_PROFILES = (function(){
const EYES = ["BLK","BLU","BRO","DIC","GRY","GRN","HAZ","MAR","PNK","UNK"];
const HAIR = ["BAL","BLK","BLN","BRO","GRY","RED","SDY","WHI","UNK"];
function req(tag, opts={}){ return { tag, required:true, ...opts } }
function opt(tag, opts={}){ return { tag, required:false, ...opts } }
function upper(v){ return v==null? v : String(v).toUpperCase() }
function digits(len){ return new RegExp('^\d{'+len+'}$') }
function postal(){ return /^[0-9A-Z]{5,10}$/ }
function state2(){ return /^[A-Z]{2}$/ }
function gender(){ return /^(1|2|9)$/ }

function coreFields(){
return [
req('DAQ',{label:'DL Number', transform:upper, validate:/^[A-Z0-9]{3,20}$/}),
req('DCS',{label:'Last', transform:upper}),
req('DAC',{label:'First', transform:upper}),
opt('DAD',{label:'Middle', transform:upper}),
opt('DCU',{label:'Suffix', transform:upper}),
req('DBB',{label:'DOB (8 digits)'}),
req('DBD',{label:'Issue (8 digits)'}),
req('DBA',{label:'Expiry (8 digits)'}),
req('DBC',{label:'Gender', validate:gender()}),
req('DAU',{label:'Height Inches (3)', validate:digits(3)}),
req('DAY',{label:'Eye', validate:(v)=>EYES.includes(v)}),
opt('DAZ',{label:'Hair', validate:(v)=>HAIR.includes(v)}),
req('DAG',{label:'Street', transform:upper}),
req('DAI',{label:'City', transform:upper}),
req('DAJ',{label:'State', validate:state2()}),
req('DAK',{label:'Postal', validate:postal()}),
opt('DCF',{label:'Doc Discriminator', transform:upper}),
req('DCG',{label:'Country', validate:/^(USA|CAN|MEX|PRI|GUM|VIR|ASM|MNP)$/}),
];
}

function profile(id,label,iin){
return {
id, label, iin, country:'USA',
aamvaVersion:10, jurisdictionVersion:1, dateFormat:'auto',
realId:{ supported:true, default:'auto', tags:['DDA','DDB','DDC','DDD'] },
subfiles:[{ type:'DL', fields: coreFields() }]
};
}

const VA = profile('VA','Virginia',636000);
const CA = profile('CA','California',636014);
const TX = profile('TX','Texas',636015);
const FL = profile('FL','Florida',636010);
const NY = profile('NY','New York',636001);
const AZ = profile('AZ','Arizona',636026);
const WA = profile('WA','Washington',636045);
const PA = profile('PA','Pennsylvania',636025);
const CO = profile('CO','Colorado',636020);
const GA = profile('GA','Georgia',636055);

const list = [VA, CA, TX, FL, NY, AZ, WA, PA, CO, GA];
const map = Object.fromEntries(list.map(p=>[p.id,p]));
return { list, map };
})();
