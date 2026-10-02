const $=s=>document.querySelector(s),E=Store.esc,B=Store.brl;
let foto='',filtro='Todos',sabs=[];
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),2000)}
function entrar(){$('#login').hidden=true;$('#app').hidden=false;lista();pedidos();conf();mk();vendas()}
$('#login-form').onsubmit=e=>{e.preventDefault();
  if($('#senha').value===Store.config().senha){SS.set('admin','1');entrar()}else $('#erro').textContent='Senha incorreta. Tente novamente.'};
$('#sair').onclick=()=>{SS.del('admin');location.reload()};
$('#tabs').onclick=e=>{const t=e.target.dataset.t;if(!t)return;
  document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b===e.target));
  document.querySelectorAll('.tab').forEach(s=>s.hidden=s.id!=='t-'+t);
  ({produtos:lista,pedidos,vendas,marketing:mk,config:conf})[t]()};
/* ---------- produtos ---------- */
function lista(){const ps=Store.produtos(),ped=Store.pedidos().filter(x=>x.status!=='Cancelado');
  const val=ps.reduce((a,p)=>a+p.preco*p.estoque,0);
  $('#stats').innerHTML=[[ps.length,'Produtos'],[ps.filter(p=>p.desc>0).length,'Em promoção'],[ps.filter(p=>p.estoque<5).length,'Estoque baixo'],[B(val),'Valor em estoque']].map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join('');
  $('#plist').innerHTML=ps.map(p=>`<tr><td>${Store.thumb(p)}</td><td><b>${E(p.nome)}</b> ${p.desc>0?`<span class="bd warn">🔥 -${p.desc}%</span>`:''}<br><small>${E(p.cat)}${(p.sabores||[]).length?' · '+p.sabores.length+' sabores':''}${p.selo?' · '+SELOS[p.selo]:''}${p.destaque?' · destaque':''}</small></td><td>${p.desc>0?`<s>${B(p.preco)}</s><br>`:''}${B(Store.preco(p))}</td><td class="${p.estoque<5?'low':''}">${p.estoque}</td>
  <td><button class="btn sm" data-e="${p.id}">Editar</button><button class="btn sm del" data-d="${p.id}">Apagar</button></td></tr>`).join('')||'<tr><td colspan="5">Nenhum produto. Cadastre o primeiro acima.</td></tr>'}
function pf(){$('#pfinal').value=B(Store.preco({preco:+$('#preco').value||0,desc:+$('#desc').value||0}))}
$('#preco').oninput=$('#desc').oninput=pf;
$('#foto').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas'),s=Math.min(1,700/im.width);c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);foto=c.toDataURL('image/jpeg',.8)};im.src=r.result};r.readAsDataURL(f)};
function rsab(){$('#sab-list').innerHTML=sabs.map((s,i)=>`<span class="chip on">${E(s)} <button type="button" data-sx="${i}" aria-label="Remover ${E(s)}">✕</button></span>`).join('')||'<small>Nenhum sabor: o produto será vendido sem escolha de sabor.</small>'}
function addsab(){const v=$('#sab-in').value.trim();if(v&&!sabs.includes(v))sabs.push(v);$('#sab-in').value='';rsab()}
$('#sab-add').onclick=addsab;
$('#sab-in').onkeydown=e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();addsab()}};
$('#sab-list').onclick=e=>{const i=e.target.dataset.sx;if(i!==undefined){sabs.splice(+i,1);rsab()}};
function limpar(){$('#pform').reset();$('#pid').value='';foto='';$('#ptitulo').textContent='Novo produto';$('#cancel').hidden=true;sabs=[];rsab();pf()}
$('#cancel').onclick=limpar;
$('#pform').onsubmit=e=>{e.preventDefault();const ps=Store.produtos(),id=+$('#pid').value;
  addsab();const d={sabores:[...sabs],nome:$('#nome').value,cat:$('#cat').value,sabor:$('#sabor').value,preco:+$('#preco').value,estoque:+$('#estoque').value,cor:$('#cor').value,destaque:$('#destaque').checked,desc:+$('#desc').value||0,selo:$('#selo').value};
  if(id){const p=ps.find(x=>x.id===id);Object.assign(p,d);if(foto)p.img=foto}else ps.unshift({id:Date.now(),img:foto,...d});
  Store.salvar(ps);limpar();lista();toast(id?'Produto atualizado':'Produto publicado')};
$('#plist').onclick=e=>{const ps=Store.produtos(),t=e.target;
  if(t.dataset.d&&confirm('Apagar este produto da loja?')){Store.salvar(ps.filter(p=>p.id!==+t.dataset.d));lista();toast('Produto apagado')}
  if(t.dataset.e){const p=ps.find(x=>x.id===+t.dataset.e);$('#pid').value=p.id;$('#nome').value=p.nome;$('#cat').value=p.cat;$('#sabor').value=p.sabor;$('#preco').value=p.preco;$('#estoque').value=p.estoque;$('#cor').value=p.cor||'#5B4BFF';$('#destaque').checked=p.destaque;$('#desc').value=p.desc||0;$('#selo').value=p.selo||'';sabs=[...(p.sabores||[])];rsab();pf();foto='';$('#ptitulo').textContent='Editando: '+p.nome;$('#cancel').hidden=false;scrollTo({top:0,behavior:'smooth'})}};
/* ---------- pedidos ---------- */
function pedidos(){const o=Store.pedidos(),c=Store.config();
  $('#n-ped').textContent=o.filter(x=>x.status==='Novo').length||'';
  $('#ofiltro').innerHTML=['Todos','Novo','Em entrega','Entregue','Cancelado'].map(s=>`<button class="chip ${s===filtro?'on':''}" data-f="${s}">${s} (${s==='Todos'?o.length:o.filter(x=>x.status===s).length})</button>`).join('');
  const l=o.filter(x=>filtro==='Todos'||x.status===filtro);
  $('#olist').innerHTML=l.map(x=>{const e=x.end||{};
   const pg=x.pago?'<span class="bd ok">Pago</span>':x.pag==='agora'?'<span class="bd warn">Aguardando pagamento online</span>':'<span class="bd">Cobrar na entrega</span>';
   let acao='';
   if(x.status==='Novo')acao=`<select id="ent-${x.id}"><option value="">Escolha o entregador</option>${c.entregadores.map(n=>`<option>${E(n)}</option>`).join('')}</select><button class="btn solid" data-send="${x.id}">Enviar para entrega</button>`;
   if(x.status==='Em entrega')acao=`<span>Com <b>${E(x.entregador)}</b></span><button class="btn solid" data-done="${x.id}">Marcar entregue</button>`;
   if(x.status==='Entregue')acao=`<span>Entregue por <b>${E(x.entregador||'—')}</b> em ${x.entregueEm||''}</span>`;
   const canc=x.status==='Novo'||x.status==='Em entrega';
   return`<article class="ord s-${x.status.replace(' ','')}"><div class="oh"><b>Pedido #${x.num||''}</b><span class="bd st ${x.status==='Cancelado'?'can':''}">${x.status}</span>${pg}<small>${x.data}</small></div>
   <div class="ob"><div><h4>Cliente</h4>${E(x.cliente)}<br>${E(x.tel)}</div>
   <div><h4>Endereço de entrega</h4>${e.rua?`${E(e.rua)}, ${E(e.numero)}<br>${E(e.bairro)}${e.comp?' · '+E(e.comp):''}`:'Não informado'}</div>
   <div><h4>Itens</h4>${x.itens.map(i=>`${i.q}x ${E(i.nome)}${i.sabor?` (${E(i.sabor)})`:''}`).join('<br>')}<br>${x.cupom?`Cupom ${E(x.cupom)}: -${B(x.desconto)}<br>`:''}${x.taxa?`Entrega: ${B(x.taxa)}<br>`:''}<b>${B(x.total)}</b></div></div>
   <div class="oa">${acao}${!x.pago&&x.status!=='Cancelado'?`<button class="btn" data-paid="${x.id}">Confirmar pagamento</button>`:''}${canc?`<button class="btn del" data-cancel="${x.id}">Cancelar pedido</button>`:''}</div></article>`}).join('')||'<p class="empty">Nenhum pedido nesta lista.</p>'}
$('#ofiltro').onclick=e=>{if(e.target.dataset.f){filtro=e.target.dataset.f;pedidos()}};
$('#olist').onclick=e=>{const d=e.target.dataset,o=Store.pedidos();
  const x=o.find(p=>p.id===+(d.send||d.done||d.paid||d.cancel));if(!x)return;
  if(d.send){const v=$('#ent-'+x.id).value;if(!v)return toast('Escolha o entregador primeiro');x.entregador=v;x.status='Em entrega'}
  if(d.done){x.status='Entregue';x.entregueEm=new Date().toLocaleString('pt-BR')}
  if(d.paid)x.pago=true;
  if(d.cancel){if(!confirm('Cancelar este pedido e devolver os itens ao estoque?'))return;
    const ps=Store.produtos();x.itens.forEach(i=>{const p=ps.find(z=>z.id===i.pid);if(p)p.estoque+=i.q});Store.salvar(ps);x.status='Cancelado'}
  DB.set('pods_pedidos',o);pedidos();lista();toast('Pedido atualizado')};
/* ---------- vendas ---------- */
const MES=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
function bars(a,val){const m=Math.max(1,...a.map(x=>x.v));
  return`<div class="bars">${a.map(x=>`<div class="bar-c" title="${x.l}: ${B(x.v)}">${val&&x.v?`<small>${B(x.v)}</small>`:''}<i style="height:${x.v/m*85}%"></i><span>${x.l}</span></div>`).join('')}</div>`}
function vendas(){const o=Store.pedidos().filter(x=>x.status!=='Cancelado'),n=new Date();
  const sum=l=>l.reduce((a,x)=>a+x.total,0),dt=x=>new Date(x.id);
  const dia=(x,d=n)=>dt(x).toDateString()===d.toDateString(),mes=(x,m=n.getMonth())=>dt(x).getMonth()===m&&dt(x).getFullYear()===n.getFullYear(),ano=x=>dt(x).getFullYear()===n.getFullYear();
  $('#v-per').innerHTML=[['Hoje',x=>dia(x)],['Este mês',x=>mes(x)],['Este ano',ano]].map(([t,f])=>{const l=o.filter(f),s=sum(l);return`<div class="stat"><span>${t}</span><b>${B(s)}</b><small>${l.length} pedido(s) · ticket médio ${B(l.length?s/l.length:0)}</small></div>`}).join('');
  const rec=sum(o.filter(x=>x.pago));
  $('#v-fin').innerHTML=[[B(sum(o)),'Faturamento total'],[B(rec),'Já recebido'],[B(sum(o)-rec),'A receber'],[o.filter(x=>x.status==='Novo'||x.status==='Em entrega').length,'Pedidos em aberto']].map(s=>`<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join('');
  $('#v-7').innerHTML=bars([6,5,4,3,2,1,0].map(k=>{const d=new Date(n);d.setDate(n.getDate()-k);return{l:`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`,v:sum(o.filter(x=>dia(x,d)))}}),1);
  $('#v-12').innerHTML=bars(MES.map((l,i)=>({l,v:sum(o.filter(x=>mes(x,i)))})));
  const t={};o.forEach(x=>x.itens.forEach(i=>{const k=i.nome+(i.sabor?' — '+i.sabor:'');t[k]=t[k]||{q:0,v:0};t[k].q+=i.q;t[k].v+=i.q*i.preco}));
  const top=Object.entries(t).sort((a,b)=>b[1].q-a[1].q).slice(0,6),mx=Math.max(1,...top.map(x=>x[1].q));
  $('#v-top').innerHTML=top.length?`<div class="rk">${top.map(([nm,v])=>`<div><b><span>${E(nm)}</span><span>${v.q} un · ${B(v.v)}</span></b><i style="width:${v.q/mx*100}%"></i></div>`).join('')}</div>`:'<p class="empty">Sem vendas ainda.</p>';
  const ag=o.filter(x=>x.pag==='agora'),en=o.filter(x=>x.pag!=='agora'),ent={};
  o.filter(x=>x.status==='Entregue').forEach(x=>{const k=x.entregador||'—';ent[k]=(ent[k]||0)+1});
  $('#v-pg').innerHTML=`<div class="rk"><div><b><span>Pagar agora</span><span>${ag.length} · ${B(sum(ag))}</span></b></div><div><b><span>Pagar na entrega</span><span>${en.length} · ${B(sum(en))}</span></b></div></div><h4 style="margin:1rem 0 .5rem">Entregas por entregador</h4>${Object.keys(ent).length?`<div class="rk">${Object.entries(ent).map(([k,v])=>`<div><b><span>${E(k)}</span><span>${v} entrega(s)</span></b></div>`).join('')}</div>`:'<p class="empty">Nenhuma entrega concluída.</p>'}`}
/* ---------- marketing ---------- */
function mk(){const c=Store.config();$('#m-on').checked=!!c.avisoOn;$('#m-txt').value=c.aviso||'';
  $('#klist').innerHTML=(c.cupons||[]).map(k=>`<span class="chip on">${E(k.codigo)} · ${k.pct}% <button data-k="${E(k.codigo)}" aria-label="Remover ${E(k.codigo)}">✕</button></span>`).join('')||'<p>Nenhum cupom criado.</p>'}
$('#mform').onsubmit=e=>{e.preventDefault();DB.set('pods_config',{...Store.config(),avisoOn:$('#m-on').checked,aviso:$('#m-txt').value.trim()});toast('Anúncio salvo')};
$('#kform').onsubmit=e=>{e.preventDefault();const c=Store.config(),cod=$('#k-cod').value.trim().toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(!cod)return;c.cupons=(c.cupons||[]).filter(k=>k.codigo!==cod).concat({codigo:cod,pct:Math.min(90,Math.max(1,+$('#k-pct').value))});DB.set('pods_config',c);e.target.reset();mk();toast('Cupom criado')};
$('#klist').onclick=e=>{const k=e.target.dataset.k;if(!k)return;const c=Store.config();c.cupons=c.cupons.filter(x=>x.codigo!==k);DB.set('pods_config',c);mk()};
/* ---------- configurações ---------- */
function conf(){const c=Store.config();
  [['nome','nome'],['slogan','slogan'],['horario','horario'],['area','area'],['taxa','taxa'],['gratis','gratis'],['min','minimo'],['zap','whatsapp'],['insta','instagram'],['senha','senha']].forEach(([i,k])=>$('#c-'+i).value=c[k]??'');
  $('#c-aberta').checked=!!c.aberta;
  $('#elist').innerHTML=c.entregadores.map(n=>`<span class="chip on">${E(n)} <button data-rm="${E(n)}" aria-label="Remover ${E(n)}">✕</button></span>`).join('')||'<p>Nenhum entregador cadastrado.</p>'}
$('#cform').onsubmit=e=>{e.preventDefault();const n=i=>+$(i).value||0;
  DB.set('pods_config',{...Store.config(),nome:$('#c-nome').value,slogan:$('#c-slogan').value,horario:$('#c-horario').value,area:$('#c-area').value,taxa:n('#c-taxa'),gratis:n('#c-gratis'),minimo:n('#c-min'),whatsapp:$('#c-zap').value.replace(/\D/g,''),instagram:$('#c-insta').value.replace(/[^\w.]/g,''),senha:$('#c-senha').value,aberta:$('#c-aberta').checked});toast('Configurações salvas')};
$('#eform').onsubmit=e=>{e.preventDefault();const c=Store.config(),n=$('#e-nome').value.trim();
  if(n&&!c.entregadores.includes(n)){c.entregadores.push(n);DB.set('pods_config',c)}$('#e-nome').value='';conf();toast('Entregador adicionado')};
$('#elist').onclick=e=>{const n=e.target.dataset.rm;if(!n)return;const c=Store.config();c.entregadores=c.entregadores.filter(x=>x!==n);DB.set('pods_config',c);conf()};
$('#exp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({produtos:Store.produtos(),pedidos:Store.pedidos(),config:Store.config()},null,1)],{type:'application/json'}));a.download='backup-loja.json';a.click()};
$('#imp').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{try{const d=JSON.parse(r.result);if(!confirm('Substituir os dados atuais pelo backup?'))return;DB.set('pods_produtos',d.produtos||[]);DB.set('pods_pedidos',d.pedidos||[]);DB.set('pods_config',d.config||{});location.reload()}catch(x){toast('Arquivo de backup inválido')}};r.readAsText(f)};
$('#zpe').onclick=()=>{if(confirm('Apagar TODOS os pedidos? Isso não pode ser desfeito.')){DB.set('pods_pedidos',[]);pedidos();vendas();lista();toast('Pedidos apagados')}};
$('#zpr').onclick=()=>{if(confirm('Substituir os produtos atuais pelos de exemplo?')){Store.salvar(SEED);lista();toast('Produtos restaurados')}};
/* inicialização: sempre por último, depois de todas as funções e variáveis existirem */
rsab();
if(SS.get('admin'))entrar();
