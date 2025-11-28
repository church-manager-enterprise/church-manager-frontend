# 🔐 Sistema de Autenticação - Church Manager

## ✅ Implementação Completa

Foi implementado um sistema completo de autenticação com os seguintes componentes:

### 📁 Arquivos Criados

#### 1. **Componente de Login**
- `src/app/components/login/login.ts` - Lógica do componente
- `src/app/components/login/login.html` - Template HTML
- `src/app/components/login/login.scss` - Estilos CSS
- `src/app/components/login/login.spec.ts` - Testes

#### 2. **Serviço de Autenticação**
- `src/app/services/auth.service.ts` - Serviço principal
- `src/app/services/auth.service.spec.ts` - Testes

#### 3. **Guard de Autenticação**
- `src/app/guards/auth.guard.ts` - Proteção de rotas
- `src/app/guards/auth.guard.spec.ts` - Testes

#### 4. **Interceptor HTTP**
- `src/app/interceptors/auth.interceptor.ts` - Adiciona token JWT automaticamente
- `src/app/interceptors/auth.interceptor.spec.ts` - Testes

---

## 🚀 Funcionalidades Implementadas

### ✨ Tela de Login
- ✅ Formulário reativo com validação
- ✅ Campo de email (obrigatório e formato válido)
- ✅ Campo de senha (obrigatório, mínimo 6 caracteres)
- ✅ Mensagens de erro em tempo real
- ✅ Loading state durante requisição
- ✅ Design moderno e responsivo
- ✅ Link para voltar à página inicial

### 🔧 Serviço de Autenticação
- ✅ Método `login(email, password)` - Autentica usuário
- ✅ Método `register(data)` - Registra novo usuário (preparado)
- ✅ Método `logout()` - Faz logout
- ✅ Método `isAuthenticated()` - Verifica autenticação
- ✅ Método `getToken()` - Obtém token JWT
- ✅ **Modo simulação** - Funciona sem backend (URL vazia)
- ✅ **Pronto para produção** - Basta configurar URL

### 🛡️ Segurança
- ✅ Guard para proteger rotas autenticadas
- ✅ Interceptor para adicionar token JWT nas requisições
- ✅ Gerenciamento de token no localStorage
- ✅ Tratamento de erros HTTP

---

## 🎯 Como Testar

### 1. Iniciar o Servidor
```bash
npm start
```

### 2. Acessar a Aplicação
```
http://localhost:4200
```

### 3. Navegar para Login
- Clique em "@ Entrar" no header
- Ou acesse diretamente: `http://localhost:4200/login`

### 4. Fazer Login
- Digite qualquer email válido (ex: `admin@church.com`)
- Digite qualquer senha com 6+ caracteres (ex: `123456`)
- Clique em "Entrar"
- Você será redirecionado para a home

### 5. Verificar Token
- Abra DevTools (F12)
- Vá em Application > Local Storage
- Veja o token salvo em `auth_token`

---

## 🔌 Configurar Backend

Quando seu backend estiver pronto:

### 1. Edite o Serviço
```typescript
// src/app/services/auth.service.ts
private apiUrl = 'https://sua-api.com/api'; // Altere aqui
```

### 2. Endpoints Esperados

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "senha123"
}

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1",
    "email": "usuario@email.com",
    "name": "Nome do Usuário"
  }
}
```

#### Registro
```http
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "senha123",
  "name": "Nome do Usuário"
}

Response 201:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1",
    "email": "usuario@email.com",
    "name": "Nome do Usuário"
  }
}
```

---

## 🛣️ Rotas Configuradas

- `/` - Página inicial (Home)
- `/login` - Página de login

---

## 🎨 Design

A tela de login possui:
- ✅ Gradiente roxo de fundo
- ✅ Card branco centralizado
- ✅ Logo da igreja
- ✅ Título "CHURCH MANAGER"
- ✅ Campos de formulário estilizados
- ✅ Validação visual (bordas vermelhas)
- ✅ Botão com efeito hover
- ✅ Loading spinner animado
- ✅ Links para recuperação de senha e cadastro
- ✅ Totalmente responsivo

---

## 📝 Exemplos de Uso

### Proteger uma Rota

```typescript
// app.routes.ts
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard] // ← Adicione o guard
  }
];
```

### Usar o Serviço em um Componente

```typescript
import { AuthService } from '../services/auth.service';

export class MeuComponente {
  constructor(private authService: AuthService) {}

  verificarLogin() {
    if (this.authService.isAuthenticated()) {
      console.log('Usuário está logado');
      console.log('Token:', this.authService.getToken());
    }
  }

  fazerLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
```

### Fazer Requisição Autenticada

```typescript
// O interceptor adiciona o token automaticamente!
this.http.get('https://api.com/dados-protegidos')
  .subscribe(data => {
    // Token JWT é enviado automaticamente no header
    // Authorization: Bearer <seu-token>
  });
```

---

## 🔍 Debugging

### Ver Requisições HTTP
1. Abra DevTools (F12)
2. Vá em Network
3. Faça login
4. Veja a requisição simulada no console

### Ver Token Salvo
1. DevTools (F12)
2. Application > Local Storage
3. Procure por `auth_token`

---

## 📦 Dependências Instaladas

Todas as dependências necessárias já estão no Angular:
- ✅ `@angular/common/http` - HttpClient
- ✅ `@angular/forms` - ReactiveFormsModule
- ✅ `@angular/router` - RouterLink, Router

---

## ✅ Checklist de Verificação

- [x] Componente de login criado
- [x] Serviço de autenticação implementado
- [x] Rotas configuradas
- [x] HttpClient configurado
- [x] Guard de autenticação criado
- [x] Interceptor HTTP criado
- [x] Validação de formulário
- [x] Tratamento de erros
- [x] Design responsivo
- [x] Modo simulação funcionando
- [x] Pronto para integração com backend

---

## 🎉 Pronto para Usar!

Seu sistema de autenticação está **100% funcional** e pronto para:
- ✅ Testes imediatos (modo simulação)
- ✅ Integração com backend (basta configurar URL)
- ✅ Expansão (adicionar mais funcionalidades)

Execute `npm start` e teste agora mesmo! 🚀
