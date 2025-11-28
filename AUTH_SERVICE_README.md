# Serviço de Autenticação - Church Manager

## Visão Geral

O serviço de autenticação (`AuthService`) foi implementado para gerenciar login, registro e autenticação de usuários no sistema Church Manager.

## Características

### 1. **Modo de Desenvolvimento (Simulação)**
Por padrão, o serviço está configurado para funcionar **sem backend**, simulando respostas de API para facilitar o desenvolvimento.

### 2. **Funcionalidades Implementadas**

- ✅ Login de usuário
- ✅ Registro de novo usuário (preparado)
- ✅ Logout
- ✅ Verificação de autenticação
- ✅ Gerenciamento de token JWT (localStorage)

## Como Usar

### Login

O componente de login já está configurado e pode ser acessado em `/login`.

```typescript
// O formulário valida:
- Email (formato válido e obrigatório)
- Senha (mínimo 6 caracteres e obrigatório)
```

### Configurar URL do Backend

Quando o backend estiver pronto, edite o arquivo:
```
src/app/services/auth.service.ts
```

Altere a linha:
```typescript
private apiUrl = ''; // URL vazia por enquanto
```

Para:
```typescript
private apiUrl = 'https://sua-api.com/api'; // URL do seu backend
```

### Endpoints Esperados

O serviço espera que o backend tenha os seguintes endpoints:

#### 1. Login
```
POST /auth/login
Body: {
  "email": "usuario@email.com",
  "password": "senha123"
}
Response: {
  "token": "jwt-token-aqui",
  "user": {
    "id": "1",
    "email": "usuario@email.com",
    "name": "Nome do Usuário"
  }
}
```

#### 2. Registro (preparado)
```
POST /auth/register
Body: {
  "email": "usuario@email.com",
  "password": "senha123",
  "name": "Nome do Usuário"
}
Response: {
  "token": "jwt-token-aqui",
  "user": {
    "id": "1",
    "email": "usuario@email.com",
    "name": "Nome do Usuário"
  }
}
```

### Usando o Serviço em Outros Componentes

```typescript
import { AuthService } from '../services/auth.service';

constructor(private authService: AuthService) {}

// Verificar se está autenticado
if (this.authService.isAuthenticated()) {
  // Usuário está logado
}

// Obter token
const token = this.authService.getToken();

// Fazer logout
this.authService.logout();
```

## Estrutura de Arquivos

```
src/app/
├── components/
│   ├── home/           # Página inicial
│   └── login/          # Página de login
│       ├── login.ts
│       ├── login.html
│       └── login.scss
├── services/
│   └── auth.service.ts # Serviço de autenticação
└── app.routes.ts       # Configuração de rotas
```

## Rotas Disponíveis

- `/` - Página inicial (Home)
- `/login` - Página de login

## Próximos Passos

1. **Implementar Guard de Autenticação**
   - Proteger rotas que precisam de autenticação

2. **Adicionar Interceptor HTTP**
   - Incluir token JWT automaticamente nas requisições

3. **Página de Registro**
   - Criar componente de cadastro de novos usuários

4. **Recuperação de Senha**
   - Implementar funcionalidade de "Esqueci minha senha"

## Testando

Para testar o login em modo simulação:
1. Acesse `http://localhost:4200/login`
2. Digite qualquer email válido
3. Digite qualquer senha (mínimo 6 caracteres)
4. Clique em "Entrar"
5. Você será redirecionado para a home

O token será salvo no localStorage e pode ser visualizado no DevTools do navegador.
