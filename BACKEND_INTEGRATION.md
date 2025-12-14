# Integração com Backend - Church Manager

## ✅ Implementação Concluída

A aplicação Angular agora está **totalmente integrada com o backend real** e **todos os métodos de simulação foram removidos**.

---

## 🔧 Alterações Realizadas

### 1. **AuthService** - `/src/app/services/auth.service.ts`

#### ✅ Removido:
- ❌ Métodos `simulateLogin()` e `simulateRegister()`
- ❌ Verificação `if (!this.apiUrl)`
- ❌ Resposta mock com objeto `user`

#### ✅ Adicionado:
- ✅ URL do backend configurada: `http://localhost:8080/api`
- ✅ Interface `LoginResponse` atualizada (apenas `token: string`)
- ✅ Tratamento de erros HTTP detalhado com mensagens específicas por status code
- ✅ Import de `HttpErrorResponse` para melhor tipagem

#### Tratamento de Erros HTTP:
```typescript
- 400: "Dados inválidos. Verifique os campos e tente novamente."
- 401: "Email ou senha incorretos."
- 403: "Acesso negado."
- 404: "Serviço não encontrado. Verifique se o servidor está rodando."
- 500: "Erro interno do servidor. Tente novamente mais tarde."
- 0: "Não foi possível conectar ao servidor. Verifique sua conexão."
```

---

### 2. **Login Component** - `/src/app/components/login/login.ts`

#### ✅ Adicionado:
- ✅ Mensagens de erro específicas baseadas no status HTTP
- ✅ Detecção de servidor offline (status 0 ou 404)
- ✅ Feedback claro para o usuário sobre diferentes tipos de erro
- ✅ Remoção do log do objeto `response` (agora só loga "Login bem-sucedido")

#### Mensagens de Erro no UI:
```typescript
- 401: "Email ou senha incorretos. Por favor, tente novamente."
- 404/0: "Não foi possível conectar ao servidor. Verifique se ele está rodando em http://localhost:8080"
- 400: "Dados inválidos. Verifique os campos e tente novamente."
- 500: "Erro interno do servidor. Tente novamente mais tarde."
- Default: error.message ou "Erro ao fazer login. Por favor, tente novamente."
```

---

## 📡 Configuração do Backend

### Endpoints Utilizados:

#### 1. **Login**
- **URL**: `POST http://localhost:8080/api/auth/login`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "senha123"
  }
  ```
- **Resposta Esperada**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### 2. **Register** (implementado mas não usado no UI ainda)
- **URL**: `POST http://localhost:8080/api/auth/register`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "senha123",
    "name": "Nome do Usuário"
  }
  ```
- **Resposta Esperada**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

## 🔐 Fluxo de Autenticação

1. **Usuário preenche formulário de login** (email + password)
2. **Validação do formulário** (email válido, senha mínimo 6 caracteres)
3. **Request HTTP** para `POST /api/auth/login`
4. **Backend retorna token JWT**
5. **Token salvo no localStorage** (compatível com SSR)
6. **Redirecionamento para /dashboard**
7. **AuthGuard protege rotas** (verifica token)
8. **AuthInterceptor adiciona token** em todas as requisições (exceto `/auth/`)

---

## 🧪 Como Testar

### 1. **Iniciar o Backend**
```bash
# Certifique-se de que o backend está rodando em http://localhost:8080
# O endpoint /api/auth/login deve estar disponível
```

### 2. **Iniciar o Frontend**
```bash
cd /home/albertojcvs/Documentos/faculdade/web/minha-app
npm start
# ou
ng serve
```

### 3. **Testar Login**
- Acesse: `http://localhost:4200/login`
- Insira credenciais válidas cadastradas no backend
- Verifique se é redirecionado para `/dashboard`
- Verifique o token no localStorage (F12 > Application > Local Storage)

### 4. **Testar Erros**
- **Credenciais inválidas**: deve mostrar "Email ou senha incorretos"
- **Backend offline**: deve mostrar mensagem sobre servidor não disponível
- **Email inválido**: validação do formulário impede envio
- **Senha curta**: validação do formulário impede envio (mínimo 6 caracteres)

---

## 🚨 Possíveis Problemas e Soluções

### Problema: CORS Error
**Sintoma**: Erro no console sobre "blocked by CORS policy"

**Solução**: Configure CORS no backend para aceitar `http://localhost:4200`
```java
// Exemplo Spring Boot
@CrossOrigin(origins = "http://localhost:4200")
```

### Problema: 404 - Endpoint não encontrado
**Sintoma**: Erro 404 ao fazer login

**Solução**: Verifique se o backend está rodando e se o endpoint é exatamente `/api/auth/login`

### Problema: Token não está sendo enviado nas requisições
**Sintoma**: Requisições protegidas retornam 401

**Solução**: Verifique o `AuthInterceptor` no console. O token deve aparecer no header `Authorization: Bearer <token>`

---

## 📋 Checklist de Verificação

- [x] AuthService configurado com URL real do backend
- [x] Métodos de simulação removidos
- [x] LoginResponse com apenas campo `token`
- [x] Tratamento de erros HTTP específicos
- [x] Mensagens de erro amigáveis no UI
- [x] Token salvo corretamente no localStorage
- [x] AuthGuard protegendo rotas
- [x] AuthInterceptor adicionando Bearer token
- [x] Compatibilidade com SSR (isPlatformBrowser)
- [ ] Testar com backend real rodando
- [ ] Conectar EventService ao backend (próximo passo)

---

## 🎯 Próximos Passos

1. **Testar integração completa** com backend rodando
2. **Implementar EventService** para buscar eventos do backend
3. **Adicionar refresh token** (se necessário)
4. **Implementar logout** que invalida token no backend
5. **Adicionar interceptor** para renovar token expirado

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique se o backend está rodando em `http://localhost:8080`
2. Confira os logs do console do browser (F12)
3. Verifique os logs do backend
4. Teste o endpoint diretamente com Postman/Insomnia
