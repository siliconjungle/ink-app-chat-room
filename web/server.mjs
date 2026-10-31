import {validateMessage,readMessage} from './chat-model.mjs';
let tail=Promise.resolve();
async function send(input,{ink,namespace}){
 const message=validateMessage(input);let existing;
 try{existing=await ink.data.get(message.id);}catch(error){if(error.status!==404)throw error;}
 if(existing){const previous=readMessage(existing);if(existing.namespace!==namespace||!previous||previous.authorId!==message.authorId||previous.text!==message.text||previous.name!==message.name)throw Object.assign(Error('This message identity is already in use'),{status:409});return previous;}
 let sequence;
 for(let attempt=0;attempt<16;attempt++){const state=await ink.state.get('chat-order'),last=state.value?.last||0;if(!Number.isSafeInteger(last)||last<0||last>=Number.MAX_SAFE_INTEGER)throw Error('Message order is unavailable');try{await ink.state.set('chat-order',{last:last+1},state.revision);sequence=last+1;break;}catch(error){if(error.status!==409||attempt===15)throw error;}}
 const value={...message,sequence,sentAt:Date.now()};const object=await ink.data.create({id:message.id,kind:'chat-message',title:message.text.slice(0,80),body:JSON.stringify(value),tags:['chat-room'],status:'sent'});return readMessage(object);
}
export async function fetch(request,context){
 const url=new URL(request.url);if(url.pathname==='/health'&&request.method==='GET')return Response.json({ok:true});
 if(url.pathname!=='/messages')return Response.json({error:'Not found'},{status:404});
 if(request.method!=='POST')return Response.json({error:'Send a message with POST'},{status:405,headers:{Allow:'POST'}});
 let input;try{input=await request.json();}catch{return Response.json({error:'Invalid message'},{status:400});}
 const operation=tail.then(()=>send(input,context));tail=operation.catch(()=>{});
 try{return Response.json({message:await operation});}catch(error){return Response.json({error:error.message||'Could not send message'},{status:error.status||503});}
}
