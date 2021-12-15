# API do Focus

O projeto consiste em uma api que incialmete é consumida pelo projeto [Focus](https://github.com/EduardoAlcebiades/focus-ui). É responsável por realizar a regra de negócio de uma academia, no qual existe treinadores e usuários comuns. As rotinas de treino podem ser montadas pelos treinadores e acessadas pelos usuários.

O projeto foi desenvolvido utilizando o ORM [Prisma](https://www.prisma.io), afim de adquirir conhecimento nessa tecnologia.

## Dependências

Para executar o projeto, é necessário ter instalado em sua máquina o [NodeJS](https://nodejs.org/pt-br/).

Será necessário criar um arquivo .env, conforme o .env.example e ajustar uma chave única em APP_KEY.

Também erá necessário instalar as dependências com os seguintes comandos:

```
$ npm install
```

```
$ npx prisma migrate dev
```

## Recomendações

Este projeto está utilizando um banco de dados relacional SQLite, mas pode ser substituído por outro.

Para iniciar com o projeto, é recomendado cadastrar uma experiência (tabela 'experiences') e um usuário (tabela 'users'). O banco de dados pode ser acessado ao rodar o seguinte comando:

```
$ npx prisma studio
```

# Iniciando servidor

Para iniciar o servidor é necessário rodar o seguinte comando:

```
$ npm run dev
```

O servidor será iniciado em http://localhost:3333.

É possível alterar a porta do servidor no arquivo .env
