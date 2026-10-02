/* PAGAMENTO ONLINE — pronto para AbacatePay (ou outro gateway).
   A chave da API NUNCA fica no navegador: crie um backend seu (Node, PHP, etc.) com a rota abaixo,
   que chama a API da AbacatePay, cria a cobrança e devolve { url: "link-de-pagamento" }.
   Depois, um webhook no backend confirma o pagamento e marca o pedido como pago. */
const Pagamento={
  endpoint:'/api/abacatepay/cobranca', // troque pela rota do seu backend
  async iniciar(p){
    const r=await fetch(this.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      pedidoId:p.id,valor:Math.round(p.total*100), // centavos
      cliente:{nome:p.cliente,celular:p.tel},
      itens:p.itens.map(i=>({nome:i.nome+(i.sabor?' - '+i.sabor:''),quantidade:i.q,preco:Math.round(i.preco*100)})),
      retorno:location.href})});
    if(!r.ok)throw new Error('Gateway indisponível');
    return r.json(); // esperado: { url }
  }
};
