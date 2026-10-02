const $=s=>document.querySelector(s),E=Store.esc;
let cart=DB.get('pods_cart',[]),cat='Todos',q='',cupom=null;
const cfg=Store.config();
$('#foot-nome').textContent=cfg.nome;$('#logo-t').textContent=cfg.nome.replace(/\s*NS$/i,'');document.title=cfg.nome+' — Loja';
if(cfg.slogan)$('#hero-p').textContent=cfg.slogan;
if(cfg.avisoOn&&cfg.aviso){const a=$('#aviso');a.textContent=cfg.aviso;a.hidden=false}
$('#contato').innerHTML=[cfg.horario&&`Horário: ${E(cfg.horario)}`,cfg.area&&`Entregamos em: ${E(cfg.area)}`,
 (cfg.whatsapp||cfg.instagram)&&[cfg.whatsapp&&`<a href="https://wa.me/${E(cfg.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a>`,cfg.instagram&&`<a href="https://instagram.com/${E(cfg.instagram)}" target="_blank" rel="noopener">Instagram</a>`].filter(Boolean).join('')].filter(Boolean).join('<br>');
if(!cfg.aberta){$('#fechado').hidden=false;$('#checkout button[type=submit]').disabled=true}
if(SS.get('idade'))$('#gate').classList.add('off');
$('#gate-ok').onclick=()=>{SS.set('idade','1');$('#gate').classList.add('off')};
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),2200)}
function card(p,small){const pf=Store.preco(p);
  const tag=p.estoque<1?'<span class="tag out">Esgotado</span>':p.selo&&SELOS[p.selo]?`<span class="tag">${SELOS[p.selo]}</span>`:p.destaque?'<span class="tag">Destaque</span>':'';
  return`<article class="card ${p.destaque&&!small?'big':''}"><div class="media">${Store.thumb(p)}${p.desc>0?`<span class="off">🔥 -${p.desc}%</span>`:''}${tag}</div>
  <div class="info"><small>${E(p.cat)} · ${E(p.sabor)}</small><h3>${E(p.nome)}</h3>${(p.sabores||[]).length?`<select class="sab" aria-label="Escolha o sabor">${p.sabores.map(s=>`<option>${E(s)}</option>`).join('')}</select>`:''}
  <div class="buy"><span class="pr">${p.desc>0?`<s>${Store.brl(p.preco)}</s>`:''}<b>${Store.brl(pf)}</b></span><button class="btn solid" data-add="${p.id}" ${p.estoque<1?'disabled':''}>Adicionar</button></div></div></article>`}
function render(){
  const all=Store.produtos(),of=all.filter(p=>p.desc>0&&p.estoque>0);
  $('#ofertas-sec').hidden=!of.length;$('#ofertas').innerHTML=of.map(p=>card(p,1)).join('');
  const cats=['Todos',...new Set(all.map(p=>p.cat))];
  $('#chips').innerHTML=cats.map(c=>`<button class="chip ${c===cat?'on':''}" data-c="${E(c)}">${E(c)}</button>`).join('');
  const list=all.filter(p=>(cat==='Todos'||p.cat===cat)&&(p.nome+(p.sabor||'')+(p.sabores||[]).join(' ')).toLowerCase().includes(q));
  $('#grid').innerHTML=list.length?list.map(p=>card(p)).join(''):'<p class="empty">Nenhum produto encontrado. Tente outra busca.</p>';
}
function calc(){const ps=Store.produtos();let sub=0,n=0;const itens=[];
  cart.forEach(i=>{const p=ps.find(x=>x.id===i.id);if(!p)return;const pf=Store.preco(p);sub+=pf*i.q;n+=i.q;itens.push({p,i,pf})});
  const desc=cupom?+(sub*cupom.pct/100).toFixed(2):0,base=sub-desc;
  const taxa=(!itens.length||(cfg.gratis>0&&base>=cfg.gratis))?0:cfg.taxa;
  return{itens,sub,n,desc,taxa,total:base+taxa}}
function renderCart(){const c=calc();
  $('#cart-items').innerHTML=c.itens.length?c.itens.map(({p,i,pf})=>`<div class="item"><b>${E(p.nome)}${i.sab?` <small>(${E(i.sab)})</small>`:''}</b><span>${Store.brl(pf*i.q)}</span><div class="qty"><button data-m="${cart.indexOf(i)}" aria-label="Diminuir">−</button>${i.q}<button data-p="${cart.indexOf(i)}" aria-label="Aumentar">+</button></div></div>`).join(''):'<p class="empty">Seu carrinho está vazio. Escolha um produto no catálogo.</p>';
  $('#resumo').innerHTML=c.itens.length?`<div><span>Subtotal</span><span>${Store.brl(c.sub)}</span></div>${c.desc?`<div><span>Cupom ${E(cupom.codigo)}</span><span>-${Store.brl(c.desc)}</span></div>`:''}<div><span>Entrega</span><span>${c.taxa?Store.brl(c.taxa):'Grátis'}</span></div>${cfg.minimo>0?`<div><span>Pedido mínimo</span><span>${Store.brl(cfg.minimo)}</span></div>`:''}`:'';
  $('#cart-total').textContent=Store.brl(c.total);$('#cart-count').textContent=c.n;DB.set('pods_cart',cart)}
function add(id,sab){const p=Store.produtos().find(x=>x.id===id),tot=cart.filter(x=>x.id===id).reduce((a,x)=>a+x.q,0);
  if(tot>=p.estoque)return toast('Limite de estoque atingido');
  const i=cart.find(x=>x.id===id&&(x.sab||'')===sab);i?i.q++:cart.push({id,sab,q:1});renderCart();toast('Adicionado ao carrinho')}
function mod(ix,d){const i=cart[ix];if(!i)return;
  if(d>0){const p=Store.produtos().find(x=>x.id===i.id),tot=cart.filter(x=>x.id===i.id).reduce((a,x)=>a+x.q,0);if(tot>=p.estoque)return toast('Limite de estoque atingido')}
  i.q+=d;cart=cart.filter(x=>x.q>0);renderCart()}
function drawer(o){$('#drawer').classList.toggle('open',o);$('#scrim').classList.toggle('on',o)}
document.addEventListener('click',e=>{const t=e.target;
  if(t.dataset.c){cat=t.dataset.c;render()}
  if(t.dataset.add){const sl=t.closest('.card').querySelector('.sab');add(+t.dataset.add,sl?sl.value:'')}
  if(t.dataset.p)mod(+t.dataset.p,1);if(t.dataset.m)mod(+t.dataset.m,-1)});
$('#busca').oninput=e=>{q=e.target.value.toLowerCase();render()};
$('#open-cart').onclick=()=>drawer(true);$('#close-cart').onclick=$('#scrim').onclick=()=>drawer(false);
$('#cupom-ok').onclick=()=>{const v=$('#cupom-in').value.trim().toUpperCase(),k=(cfg.cupons||[]).find(c=>c.codigo===v);
  cupom=k||null;$('#cupom-msg').textContent=k?`Cupom ${k.codigo} aplicado: ${k.pct}% de desconto`:(v?'Cupom inválido':'');renderCart()};
$('#checkout').onsubmit=async e=>{e.preventDefault();
  if(!cfg.aberta)return toast('A loja está fechada no momento');
  const c=calc();if(!c.itens.length)return toast('Seu carrinho está vazio');
  if(cfg.minimo>0&&c.sub<cfg.minimo)return toast('Pedido mínimo: '+Store.brl(cfg.minimo));
  const f=new FormData(e.target),ps=Store.produtos();
  const itens=c.itens.map(({p,i,pf})=>{ps.find(x=>x.id===p.id).estoque-=i.q;return{pid:p.id,nome:p.nome,sabor:i.sab||'',q:i.q,preco:pf}});
  Store.salvar(ps);
  const ped=Store.pedidos(),num=ped.length+1,pag=f.get('pag');
  const novo={id:Date.now(),num,cliente:f.get('cliente'),tel:f.get('tel'),end:{rua:f.get('rua'),numero:f.get('numero'),bairro:f.get('bairro'),comp:f.get('comp')},itens,subtotal:c.sub,desconto:c.desc,cupom:cupom?cupom.codigo:'',taxa:c.taxa,total:c.total,pag,pago:false,status:'Novo',entregador:'',data:new Date().toLocaleString('pt-BR')};
  ped.unshift(novo);DB.set('pods_pedidos',ped);
  cart=[];cupom=null;$('#cupom-msg').textContent='';renderCart();render();drawer(false);e.target.reset();
  let msg=`Pedido #${num} registrado. Você vai pagar na entrega.`;
  if(pag==='agora'){try{const r=await Pagamento.iniciar(novo);if(r&&r.url){location.href=r.url;return}}
    catch(err){msg=`Pedido #${num} registrado, mas o pagamento online ainda não está ativo. Combine o pagamento com a loja.`}}
  $('#done-p').textContent=msg;$('#done').hidden=false};
$('#done-ok').onclick=()=>{$('#done').hidden=true};
render();renderCart();
