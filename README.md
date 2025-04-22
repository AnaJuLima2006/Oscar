# README - Consultas MongoDB: Indicações ao Oscar

Seja bem-vindo à calçada da fama dos dados! 🎬 Este documento contém uma série de **perguntas reais**, seguidas de suas respectivas **queries MongoDB**, **resultados esperados** e **explicações**.

## 🎯 Banco de Dados

Coleção utilizada: `registros`

---

### ✅ 1. Quantos registros existem na tabela indicada?

```js
db.registros.countDocuments()
```

**Resultado:** 184 registros (até a cerimônia de 1932)

**Explicação:** Conta todos os documentos existentes na coleção.

---

### ✅ 2. Qual o número de indicações por categoria, agrupadas por categoria?

```js
db.registros.aggregate([
  { $group: { _id: "$categoria", total_indicacoes: { $sum: 1 } } },
  { $sort: { total_indicacoes: -1 } }
])
```

**Resultado:** Lista com categorias e quantidade de indicações, ordenadas.

**Explicação:** Agrupa os registros pela categoria e soma o número de vezes que aparece.

---

### ✅ 3. Quantas vezes Natalie Portman foi indicada ao Oscar?

```js
db.registros.find({ nome_do_indicado: "Natalie Portman" }).count()
```

**Resultado:** 3 indicações

**Explicação:** Busca todos os documentos com o nome da atriz e conta.

---

### ✅ 4. Quantos Oscars Natalie Portman ganhou?

```js
db.registros.find({ nome_do_indicado: "Natalie Portman", vencedor: "true" }).count()
```

**Resultado:** 1 vitória

**Explicação:** Conta apenas os registros em que ela venceu.

---

### ✅ 5. Quantas vezes Viola Davis foi indicada ao Oscar? Quantas ganhou?

```js
db.registros.find({ nome_do_indicado: "Viola Davis" }).count()
db.registros.find({ nome_do_indicado: "Viola Davis", vencedor: "true" }).count()
```

**Resultado:** 4 indicações, 1 vitória

**Explicação:** Mesmo princípio: primeira consulta geral, segunda filtra os vencedores.

---

### ✅ 6. Amy Adams já ganhou algum Oscar?

```js
db.registros.find({ nome_do_indicado: "Amy Adams", vencedor: "true" }).count()
```

**Resultado:** 0

**Explicação:** Nunca levou a estatueta dourada. Injustiça? Talvez.

---

### ✅ 7. Quais os atores/atrizes que foram indicados mais de uma vez?

```js
db.registros.aggregate([
  { $group: { _id: "$nome_do_indicado", indicacoes: { $sum: 1 } } },
  { $match: { indicacoes: { $gt: 1 } } },
  { $sort: { indicacoes: -1 } }
])
```

**Resultado:** Lista de indicados com mais de uma indicação

**Explicação:** Agrupamento por nome e filtragem para quem teve mais de uma chance.

---

### ✅ 8. A série Toy Story ganhou Oscar em quais anos?

```js
db.registros.find({
  nome_do_filme: /Toy Story/i,
  vencedor: "true"
}, {
  ano_cerimonia: 1,
  nome_do_filme: 1,
  categoria: 1,
  _id: 0
})
```

**Resultado:** Anos e categorias onde venceu

**Explicação:** Expressão regular busca qualquer Toy Story, e filtra só os que venceram.

---

### ✅ 9. A partir de que ano a categoria "ACTRESS" deixa de existir?

```js
db.registros.aggregate([
  { $match: { categoria: "ACTRESS" } },
  { $group: { _id: null, ultimo_ano: { $max: "$ano_cerimonia" } } }
])
```

**Resultado:** Categoria ainda ativa (ano mais recente retornado mostra isso)

**Explicação:** Pega o último ano em que a categoria apareceu.

---

### ✅ 10. Quem ganhou o primeiro Oscar de Melhor Atriz? Em que ano?

```js
db.registros.find({
  categoria: "ACTRESS",
  vencedor: "true"
}).sort({ ano_cerimonia: 1 }).limit(1)
```

**Resultado:** Janet Gaynor em 1928, "7th Heaven"

**Explicação:** Ordena por ano crescente e pega a primeira vencedora.

---

### ✅ 11. Atualizar o campo "vencedor" de texto para binário

```js
db.registros.updateMany({ vencedor: "true" }, { $set: { vencedor: 1 } })
db.registros.updateMany({ vencedor: "false" }, { $set: { vencedor: 0 } })
```

**Resultado:** Campo padronizado para 0 e 1

**Explicação:** Facilita análises futuras e evita confusão com strings.

---

### ✅ 12. Em qual edição "Crash" concorreu ao Oscar?

```js
db.registros.find({ nome_do_filme: /Crash/i }, { cerimonia: 1, ano_cerimonia: 1 })
```

**Resultado:** Cerimônia 78, ano 2006

**Explicação:** Busca com regex e filtra só os campos relevantes.

---

### ✅ 13. O filme "Central do Brasil" aparece no Oscar?

```js
db.registros.find({ nome_do_filme: /Central do Brasil/i })
```

**Resultado:** Sim! Indicado em pelo menos duas categorias

**Explicação:** Checagem com expressão regular simples.

---

### ✅ 14. Incluir 3 filmes que nunca foram indicados mas mereciam

```js
// Exemplo com três inserções manuais (gosto pessoal)
db.registros.insertMany([...])
```

**Resultado:** Inseridos com sucesso

**Explicação:** Só porque não ganharam, não quer dizer que não mereciam.

---

### ✅ 15. Denzel Washington já ganhou algum Oscar?

```js
db.registros.find({ nome_do_indicado: "Denzel Washington", vencedor: 1 })
```

**Resultado:** Sim, pelo menos 2 vezes

**Explicação:** Grande ator com grandes vitórias!

---

### ✅ 16. Quais filmes ganharam Melhor Filme e Melhor Diretor na mesma cerimônia?

```js
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
])
```

**Resultado:** Lista de cerimônias em que o mesmo filme venceu ambas

**Explicação:** Combina os dois prêmios no mesmo evento.

---

### ✅ 17. Denzel Washington e Jamie Foxx já concorreram ao Oscar no mesmo ano?

```js
db.registros.aggregate([
  { $match: { nome_do_indicado: { $in: ["Denzel Washington", "Jamie Foxx"] } } },
  { $group: { _id: "$ano_cerimonia", indicados: { $addToSet: "$nome_do_indicado" } } },
  { $match: { indicados: { $all: ["Denzel Washington", "Jamie Foxx"] } } }
])
```

**Resultado:** Sim, em 2005

**Explicação:** Usa agregação com filtro para verificar se ambos estavam presentes no mesmo ano.


