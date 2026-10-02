const DB={
  get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){alert('Armazenamento cheio: use imagens menores.')}}
};
const SEED=[
 {id:1,nome:'Nimbus X 15K',cat:'Descartável',preco:129.9,estoque:24,sabor:'Descartável 15.000 puffs',sabores:['Blueberry Ice','Grape Ice','Menta Gelada'],destaque:true,desc:15,selo:'promo',img:'',cor:'#5B4BFF'},
 {id:2,nome:'Aura Pod Kit',cat:'Refilável',preco:189.9,estoque:12,sabor:'Kit com 2 pods',destaque:true,img:'',cor:'#FF7A59'},
 {id:3,nome:'Cartucho Mint 2ml',cat:'Pod',preco:39.9,estoque:60,sabor:'Menta gelada',destaque:false,img:'',cor:'#1FB28A'},
 {id:4,nome:'Cartucho Mango 2ml',cat:'Pod',preco:39.9,estoque:45,sabor:'Manga tropical',destaque:false,img:'',cor:'#F2A900'},
 {id:5,nome:'Vortex Slim 8K',cat:'Descartável',preco:89.9,estoque:0,sabor:'Uva gelada',destaque:false,img:'',cor:'#9B3DDB'},
 {id:6,nome:'Carregador USB-C',cat:'Acessório',preco:24.9,estoque:80,sabor:'Cabo 1m',destaque:false,img:'',cor:'#3B4B6B'}];
const SELOS={promo:'🔥 Promoção',relampago:'⚡ Oferta relâmpago',top:'⭐ Mais vendido',novo:'🆕 Novidade'};
const Store={
  produtos(){let p=DB.get('pods_produtos');if(!p){p=SEED;DB.set('pods_produtos',p)}return p},
  salvar(p){DB.set('pods_produtos',p)},
  pedidos:()=>DB.get('pods_pedidos',[]),
  config:()=>Object.assign({nome:'Valora Pods NS',senha:'admin123',entregadores:['Entregador 1'],aberta:true,slogan:'',horario:'',area:'',taxa:0,gratis:0,minimo:0,whatsapp:'',instagram:'',avisoOn:false,aviso:'',cupons:[]},DB.get('pods_config',{})),
  preco:p=>p.desc>0?+(p.preco*(1-p.desc/100)).toFixed(2):p.preco,
  brl:v=>Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}),
  esc:s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  thumb(p){return p.img?`<img src="${p.img}" alt="${Store.esc(p.nome)}">`:`<div class="ph" style="--c:${Store.esc(p.cor||'#5B4BFF')}"><i></i></div>`}
};
const SS={
  get(k){try{return sessionStorage.getItem(k)}catch(e){return window['_'+k]||null}},
  set(k,v){try{sessionStorage.setItem(k,v)}catch(e){window['_'+k]=v}},
  del(k){try{sessionStorage.removeItem(k)}catch(e){window['_'+k]=null}}
};
