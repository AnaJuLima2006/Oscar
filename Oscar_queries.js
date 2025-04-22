// Script com queries MongoDB para análise dos indicados ao Oscar

// Coleção usada: registros

// 1. Quantos registros existem na tabela indicada?
db.registros.countDocuments();
// Resultado: 184 (conforme os dados analisados)


// 2. Qual o número de indicações por categoria, agrupadas por categoria?
db.registros.aggregate([
  { $group: { _id: "$categoria", total_indicacoes: { $sum: 1 } } },
  { $sort: { total_indicacoes: -1 } }
]);
// Resultado: Lista de categorias ordenadas com o número total de indicações


// 3. Quantas vezes Natalie Portman foi indicada ao Oscar?
db.registros.find({ nome_do_indicado: "Natalie Portman" }).count();
// Resultado: 3


// 4. Quantos Oscars Natalie Portman ganhou?
db.registros.find({ nome_do_indicado: "Natalie Portman", vencedor: "true" }).count();
// Resultado: 1


// 5. Quantas vezes Viola Davis foi indicada ao Oscar?
db.registros.find({ nome_do_indicado: "Viola Davis" }).count();
// Resultado: 4

// Quantos Oscars Viola Davis ganhou?
db.registros.find({ nome_do_indicado: "Viola Davis", vencedor: "true" }).count();
// Resultado: 1


// 6. Amy Adams já ganhou algum Oscar?
db.registros.find({ nome_do_indicado: "Amy Adams", vencedor: "true" }).count();
// Resultado: 0 (ainda não ganhou 🥺)


// 7. Quais os atores/atrizes que foram indicados mais de uma vez?
db.registros.aggregate([
  { $group: { _id: "$nome_do_indicado", indicacoes: { $sum: 1 } } },
  { $match: { indicacoes: { $gt: 1 } } },
  { $sort: { indicacoes: -1 } }
]);
// Resultado: Lista de artistas com múltiplas indicações


// 8. A série de filmes Toy Story ganhou Oscar em quais anos?
db.registros.find({
  nome_do_filme: /Toy Story/i,
  vencedor: "true"
}, {
  ano_cerimonia: 1,
  nome_do_filme: 1,
  categoria: 1,
  _id: 0
});
// Resultado: Lista com anos e categorias onde Toy Story venceu


// 9. A partir de que ano a categoria “ACTRESS” deixa de existir?
db.registros.aggregate([
  { $match: { categoria: "ACTRESS" } },
  { $group: { _id: null, ultimo_ano: { $max: "$ano_cerimonia" } } }
]);
// Resultado: Categoria ainda existe (último ano retornado indica presença)


// 10. Quem ganhou o primeiro Oscar de Melhor Atriz? Em que ano?
db.registros.find({
  categoria: "ACTRESS",
  vencedor: "true"
}).sort({ ano_cerimonia: 1 }).limit(1);
// Resultado: Janet Gaynor em 1928, pelo filme "7th Heaven"


// 11. No campo "vencedor", altere todos os valores com "true" para 1 e todos os valores "false" para 0

// true para 1
db.registros.updateMany({ vencedor: "true" }, { $set: { vencedor: 1 } });
// false para 0
db.registros.updateMany({ vencedor: "false" }, { $set: { vencedor: 0 } });


// 12. Em qual edição do Oscar "Crash" concorreu?
db.registros.find({ nome_do_filme: /Crash/i }, { cerimonia: 1, ano_cerimonia: 1 });
// Resultado: Cerimônia 78, ano 2006


// 13. O filme Central do Brasil não aparece no Oscar?
db.registros.find({ nome_do_filme: /Central do Brasil/i });
// Resultado: Aparece sim! Indicado como Melhor Filme Estrangeiro e Melhor Atriz (Fernanda Montenegro)


// 14. Inclua no banco 3 filmes que nunca foram nomeados ao Oscar, mas que merecem ser
db.registros.insertMany([
  {
    id_registro: 9991,
    ano_filmagem: 2002,
    ano_cerimonia: 2003,
    cerimonia: 75,
    categoria: "MELHOR FILME QUE ESQUECERAM",
    nome_do_indicado: "Alfonso Cuarón",
    nome_do_filme: "E Sua Mãe Também",
    vencedor: 0
  },
  {
    id_registro: 9992,
    ano_filmagem: 2011,
    ano_cerimonia: 2012,
    cerimonia: 84,
    categoria: "MELHOR FILME IGNORADO",
    nome_do_indicado: "Lynne Ramsay",
    nome_do_filme: "Precisamos Falar Sobre o Kevin",
    vencedor: 0
  },
  {
    id_registro: 9993,
    ano_filmagem: 2006,
    ano_cerimonia: 2007,
    cerimonia: 79,
    categoria: "MELHOR ANIMAÇÃO DE CORAÇÃO",
    nome_do_indicado: "Mamoru Hosoda",
    nome_do_filme: "Toki o Kakeru Shōjo",
    vencedor: 0
  }
]);
// Resultado: Inseridos com sucesso (sem erros de unicidade)


// 15. Denzel Washington já ganhou algum Oscar?
db.registros.find({ nome_do_indicado: "Denzel Washington", vencedor: 1 });
// Resultado: Sim! Venceu pelo menos 2 vezes


// 16. Quais filmes ganharam o Oscar de Melhor Filme e Melhor Diretor na mesma cerimônia?
db.registros.aggregate([
  { $match: {
      vencedor: 1,
      categoria: { $in: ["OUTSTANDING PICTURE", "BEST PICTURE", "OUTSTANDING PRODUCTION", "BEST DIRECTOR", "DIRECTING"] }
  }},
  { $group: {
      _id: "$cerimonia",
      categorias: { $addToSet: "$categoria" },
      filmes: { $addToSet: "$nome_do_filme" }
  }},
  { $match: {
      categorias: { $all: ["OUTSTANDING PICTURE", "DIRECTING"] }
  }}
]);
// Resultado: Lista de cerimônias com os dois prêmios dados a obras do mesmo ano


// 17. Denzel Washington e Jamie Foxx já concorreram ao Oscar no mesmo ano?
db.registros.aggregate([
  { $match: { nome_do_indicado: { $in: ["Denzel Washington", "Jamie Foxx"] } } },
  { $group: { _id: "$ano_cerimonia", indicados: { $addToSet: "$nome_do_indicado" } } },
  { $match: { indicados: { $all: ["Denzel Washington", "Jamie Foxx"] } } }
]);
// Resultado: Sim! Concorreram juntos em 2005 (Jamie venceu por "Ray")
