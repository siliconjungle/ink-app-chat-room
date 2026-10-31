export const MAX_MESSAGE=4000;
export function messageIntent(event){return event.key==='Enter'&&!event.shiftKey&&!event.isComposing&&event.keyCode!==229?'send':'edit';}
export function validateMessage(input){
 if(!input||!/^[a-f0-9]{32}$/.test(input.id)||!/^[a-f0-9]{32}$/.test(input.authorId||''))throw Object.assign(Error('Invalid message identity'),{status:400});
 const text=typeof input.text==='string'?input.text.trim():'',name=typeof input.name==='string'?input.name.trim().replace(/\s+/g,' '):'';
 if(!text||text.length>MAX_MESSAGE)throw Object.assign(Error('Write a message of 1–4,000 characters'),{status:400});
 if(!name||name.length>40)throw Object.assign(Error('Choose a name of 1–40 characters'),{status:400});
 return{id:input.id,authorId:input.authorId,text,name};
}
export function readMessage(object){try{if(object.kind!=='chat-message'||object.archived)return null;const message=JSON.parse(object.body);if(!Number.isSafeInteger(message.sequence)||message.sequence<1||typeof message.text!=='string'||typeof message.name!=='string')return null;return{...message,id:object.id};}catch{return null;}}
export function orderedMessages(messages){return [...messages].sort((a,b)=>(a.sequence??Infinity)-(b.sequence??Infinity)||(a.enqueuedAt||0)-(b.enqueuedAt||0));}
export class SendQueue{
 constructor({items=[],save,send,change}){this.items=items;this.save=save;this.send=send;this.change=change;this.running=false;}
 add(message){const previous=this.items;this.items=[...previous,{...message,status:'queued'}];try{this.save(this.items);}catch(error){this.items=previous;throw error;}this.change();void this.drain();}
 acknowledge(id){if(!this.items.some(item=>item.id===id))return;this.items=this.items.filter(item=>item.id!==id);this.save(this.items);this.change();if(!this.running)void this.drain();}
 retry(){const first=this.items[0];if(first?.status==='failed'){first.status='queued';delete first.error;this.save(this.items);this.change();}void this.drain();}
 async drain(){if(this.running||this.items[0]?.status==='failed')return;this.running=true;try{while(this.items.length){const first=this.items[0];first.status='sending';this.save(this.items);this.change();try{await this.send(first);}catch(error){if(!this.items.some(item=>item.id===first.id))continue;first.status='failed';first.error=error.message||'Could not send';this.save(this.items);this.change();return;}this.items=this.items.filter(item=>item.id!==first.id);this.save(this.items);this.change();}}finally{this.running=false;}}
}
