<template>
  <div class="login-preview">
    <div class="shape-bg s1"></div>
    <div class="shape-bg s2"></div>
    <div class="shape-bg s3"></div>
    <div class="glass-card">
      <div class="brand-panel">
        <div class="logo-box">
          <NoaBadge size="26px" />
        </div>
        <p class="brand-desc">Plataforma de gestión ERP diseñada para eficiencia, seguridad y escalabilidad en tu
          operación logística.</p>
        <div class="brand-badges">
          <span class="badge badge-blue">ERP</span>
          <span class="badge badge-green">Seguro</span>
          <span class="badge badge-sky">Cloud</span>
        </div>
        <div class="brand-terms">Términos y <a href="#">Condiciones</a></div>
      </div>
      <div class="form-panel">
        <div class="form-head">
          <h3 class="form-title-text">Iniciar Sesión</h3>
          <p class="form-sub">Accede a NOA Transportes para gestionar tu flota</p>
        </div>
        <hr class="divider-line">
        <form class="row g-3" @submit.prevent="handleLogin" novalidate>
          <div class="col-12">
            <div class="fgroup">
              <label class="flabel" for="login-email">Correo Electrónico</label>
              <div class="iw">
                <span class="iico">✉</span>
                <input
                  id="login-email"
                  class="finput"
                  :class="{ 'finput-error': errors.email }"
                  type="email"
                  autocomplete="email"
                  placeholder="nombre@empresa.com"
                  v-model="formData.email"
                  :aria-invalid="!!errors.email"
                  aria-describedby="login-email-error"
                >
              </div>
              <span v-if="errors.email" id="login-email-error" class="ferror" role="alert">{{ errors.email }}</span>
            </div>
          </div>
          <div class="col-12">
            <div class="fgroup">
              <div class="flabel-row">
                <label class="flabel" for="login-password">Contraseña</label>
                <a href="#" class="flink">¿Olvidaste tu contraseña?</a>
              </div>
              <div class="iw">
                <span class="iico">🔒</span>
                <input
                  id="login-password"
                  class="finput finput-pw"
                  :class="{ 'finput-error': errors.password }"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  v-model="formData.password"
                  :aria-invalid="!!errors.password"
                  aria-describedby="login-password-error"
                >
                <button
                  type="button"
                  class="pw-toggle"
                  :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? '🙈' : '👁' }}
                </button>
              </div>
              <span v-if="errors.password" id="login-password-error" class="ferror" role="alert">{{ errors.password }}</span>
            </div>
          </div>
          <div v-if="loginError" class="col-12">
            <div class="alert-error" role="alert">{{ loginError }}</div>
          </div>
          <div class="col-12">
            <button class="btn-main" type="submit" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="btn-spinner" aria-hidden="true"></span>
              {{ isSubmitting ? 'Accediendo...' : 'Acceder a NOA Transportes →' }}
            </button>
            <div class="or-divider">
              <div class="or-line"></div>
              <span class="or-text">o continúa con</span>
              <div class="or-line"></div>
            </div>
            <button class="btn-google" type="button" :disabled="isSubmitting" @click="handleGoogleLogin">
              <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4" />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853" />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05" />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335" />
              </svg>
              Continuar con Google
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * @author Darwin Montes
 * @version 1.1.0
 * @created_at 2026-07-27
 * @module {Features.Auth}
 * @resource {Session}
 */
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth.store.js';
import { useFormManager } from '@/hooks/useFormManager.js';
import { handleGlobalError } from '@/utils/error-handler.js';
import NoaBadge from '@/components/NoaBadge.vue';

const router = useRouter();
const authStore = useAuthStore();

const { formData, errors, isSubmitting, validate } = useFormManager(
  { email: '', password: '' },
  {
    email: { required: true },
    password: { required: true }
  }
);

const showPassword = ref(false);
const loginError = ref('');

/**
 * Valida el formulario y autentica al usuario contra el store de sesión.
 * @returns {Promise<void>}
 */
const handleLogin = async () => {
  loginError.value = '';
  if (!validate()) return;

  isSubmitting.value = true;
  try {
    await authStore.login(formData);
    router.push('/dashboard');
  } catch (error) {
    loginError.value = error?.response?.data?.message ?? 'Correo o contraseña incorrectos.';
    handleGlobalError(error, 'LoginView', { redirectToLogin: false });
  } finally {
    isSubmitting.value = false;
  }
};

const handleGoogleLogin = () => {
  // Pendiente de integración con proveedor OAuth de Google
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
.login-preview{font-family:'Outfit',sans-serif;--primary:#2c7be5;--primary-dark:#1a68d1;--accent:#00d27a;--sky:#00d2f4;background:linear-gradient(135deg,#f0f6ff 0%,#ffffff 50%,#f1f5f9 100%);border-radius:16px;padding:2rem;min-height:520px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;}
.shape-bg{position:absolute;border-radius:50%;filter:blur(50px);pointer-events:none;}
.s1{width:280px;height:280px;background:rgba(44,123,229,0.12);top:-80px;right:-60px;}
.s2{width:220px;height:220px;background:rgba(0,210,122,0.09);bottom:-40px;left:-40px;}
.s3{width:140px;height:140px;background:rgba(0,210,244,0.09);bottom:15%;right:8%;}
.glass-card{background:rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.95);border-radius:20px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.04),0 20px 50px -10px rgba(44,123,229,0.12),0 0 0 1px rgba(226,232,240,0.5);display:grid;grid-template-columns:1fr 1.2fr;width:100%;max-width:780px;}
.brand-panel{background:linear-gradient(160deg,rgba(44,123,229,0.04) 0%,rgba(0,210,244,0.025) 100%);padding:2.5rem 1.75rem;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;border-right:1px solid #e2e8f0;position:relative;}
.brand-panel::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#2c7be5,#00d2f4,#00d27a);}
.brand-panel::after{content:'';position:absolute;bottom:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(44,123,229,0.15),transparent);}
.logo-box{width:100%;max-width:340px;margin:0 auto 1.5rem;display:flex;align-items:center;justify-content:center;}
.brand-logo{width:100%;height:auto;max-height:150px;object-fit:contain;display:block;}
.brand-name{font-size:2rem;font-weight:800;color:#0f172a;margin:0 0 0.75rem;letter-spacing:-0.5px;}
.brand-name span{background:linear-gradient(90deg,#2c7be5,#00d2f4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.brand-desc{color:#475569;font-size:0.875rem;line-height:1.65;margin:0 0 1.75rem;}
.brand-badges{display:flex;gap:8px;justify-content:center;margin-bottom:1.5rem;}
.badge{font-size:0.7rem;font-weight:600;padding:4px 10px;border-radius:20px;letter-spacing:0.3px;}
.badge-blue{background:rgba(44,123,229,0.1);color:#1a68d1;}
.badge-green{background:rgba(0,210,122,0.1);color:#0a8a50;}
.badge-sky{background:rgba(0,210,244,0.1);color:#0899b0;}
.brand-terms{font-size:0.75rem;color:#94a3b8;}
.brand-terms a{color:#2c7be5;text-decoration:none;font-weight:500;}
.form-panel{padding:2.5rem 2rem;background:#fff;display:flex;flex-direction:column;justify-content:center;}
.form-head{margin-bottom:1.5rem;}
.form-title-text{font-size:1.4rem;font-weight:700;color:#0f172a;margin:0 0 0.35rem;}
.form-sub{font-size:0.85rem;color:#64748b;margin:0;}
.divider-line{height:1px;background:linear-gradient(90deg,rgba(44,123,229,0.3),rgba(0,210,244,0.2),transparent);margin:0 0 1.5rem;border:none;}
.fgroup{margin-bottom:1.25rem;}
.flabel-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;}
.flabel{display:block;font-size:0.8rem;font-weight:600;color:#334155;letter-spacing:0.2px;margin-bottom:0.4rem;}
.flabel-row .flabel{margin-bottom:0;}
.flink{font-size:0.75rem;color:#2c7be5;text-decoration:none;font-weight:500;}
.flink:hover{text-decoration:underline;}
.iw{position:relative;display:flex;align-items:center;}
.iico{position:absolute;left:13px;color:#94a3b8;font-size:13px;z-index:2;line-height:1;}
.finput{width:100%;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:10px 12px 10px 38px;color:#0f172a;font-size:0.9rem;font-family:'Outfit',sans-serif;box-sizing:border-box;transition:all 0.2s;}
.finput:focus{outline:none;border-color:#2c7be5;background:#fff;box-shadow:0 0 0 3px rgba(44,123,229,0.12);}
.finput::placeholder{color:#94a3b8;}
.finput-pw{padding-right:38px;}
.finput-error{border-color:#e5484d;background:#fef4f4;}
.pw-toggle{position:absolute;right:10px;background:none;border:none;cursor:pointer;font-size:14px;line-height:1;padding:2px;color:#94a3b8;}
.ferror{display:block;font-size:0.75rem;color:#e5484d;margin-top:0.35rem;}
.alert-error{background:#fef4f4;border:1px solid #f4b8ba;color:#c2222a;font-size:0.82rem;padding:10px 12px;border-radius:8px;}
.btn-main{width:100%;padding:11px;background:linear-gradient(135deg,#2c7be5,#1a68d1);color:white;border:none;border-radius:10px;font-weight:700;font-size:0.95rem;margin-top:0.5rem;cursor:pointer;letter-spacing:0.2px;box-shadow:0 4px 16px rgba(44,123,229,0.35);font-family:'Outfit',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;}
.btn-main:disabled{opacity:0.7;cursor:not-allowed;}
.btn-spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.or-divider{display:flex;align-items:center;gap:10px;margin:1rem 0;}
.or-line{flex:1;height:1px;background:#e2e8f0;}
.or-text{font-size:0.75rem;color:#94a3b8;font-weight:500;white-space:nowrap;}
.btn-google{width:100%;padding:10px 16px;background:#fff;border:1.5px solid #e2e8f0;border-radius:10px;font-weight:600;font-size:0.9rem;cursor:pointer;font-family:'Outfit',sans-serif;color:#334155;display:flex;align-items:center;justify-content:center;gap:10px;transition:all 0.2s;box-shadow:0 1px 4px rgba(0,0,0,0.05);}
.btn-google:hover{border-color:#cbd5e1;background:#f8fafc;box-shadow:0 2px 8px rgba(0,0,0,0.08);}
.btn-google:disabled{opacity:0.6;cursor:not-allowed;}
.google-icon{width:18px;height:18px;flex-shrink:0;}

@media (max-width: 768px) {
  .glass-card {
    grid-template-columns: 1fr;
    max-width: 460px;
  }
  .brand-panel {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    padding: 2rem 1.5rem;
  }
  .brand-panel::before {
    background: linear-gradient(90deg, #2c7be5, #00d2f4, #00d27a);
  }
  .form-panel {
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .login-preview {
    padding: 1rem;
    min-height: auto;
  }
  .brand-panel {
    padding: 1.5rem 1rem;
  }
  .brand-desc {
    display: none;
  }
  .logo-box {
    max-width: 260px;
    margin-bottom: 0.75rem;
    padding: 0;
  }
  .brand-name {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  .brand-badges {
    margin-bottom: 1rem;
  }
  .form-panel {
    padding: 1.5rem 1rem;
  }
}
</style>