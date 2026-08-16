// Supabase Configuration
const SUPABASE_URL = 'https://tnkauduohjafnezlojtc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2F1ZHVvaGphZm5lemxvanRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4Mjk4NjMsImV4cCI6MjEwMjQwNTg2M30.4Ii96NvRWYDkISroXCOHmrBU3JjaVBnchR1Mg0B6PPU';

let supabase = null;
if (window.supabase) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("container");
  const signUpBtn = document.getElementById("signUp");
  const signInBtn = document.getElementById("signIn");

  // Panel Switch Event Listeners
  if (signUpBtn && container) {
    signUpBtn.addEventListener("click", (e) => {
      e.preventDefault();
      container.classList.add("right-panel-active");
    });
  }

  if (signInBtn && container) {
    signInBtn.addEventListener("click", (e) => {
      e.preventDefault();
      container.classList.remove("right-panel-active");
    });
  }

  // Toggle Password Visibility
  const setupPasswordToggle = (inputId, toggleId) => {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    if (!input || !toggle) return;
    
    toggle.addEventListener("click", () => {
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      toggle.classList.toggle("fa-eye", !isPassword);
      toggle.classList.toggle("fa-eye-slash", isPassword);
    });
  };

  setupPasswordToggle("signupPassword", "toggleSignupPassword");
  setupPasswordToggle("signinPassword", "toggleSigninPassword");

  // Password Strength Checker & Caps Lock Detection
  const passwordInput = document.getElementById("signupPassword");
  const strengthBar = document.getElementById("strengthBar");
  const capsAlert = document.getElementById("capsAlert");

  if (passwordInput) {
    passwordInput.addEventListener("keyup", (e) => {
      if (e.getModifierState("CapsLock")) {
        if (capsAlert) capsAlert.style.display = "block";
      } else {
        if (capsAlert) capsAlert.style.display = "none";
      }

      const val = passwordInput.value;
      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      if (strengthBar) {
        switch (score) {
          case 0:
          case 1:
            strengthBar.style.width = "25%";
            strengthBar.style.backgroundColor = "#ef4444";
            break;
          case 2:
            strengthBar.style.width = "50%";
            strengthBar.style.backgroundColor = "#f59e0b";
            break;
          case 3:
            strengthBar.style.width = "75%";
            strengthBar.style.backgroundColor = "#3b82f6";
            break;
          case 4:
            strengthBar.style.width = "100%";
            strengthBar.style.backgroundColor = "#10b981";
            break;
        }
      }
    });
  }

  // Helper function to show status messages
  const showMessage = (element, text, isError = false) => {
    if (!element) return;
    element.className = `message-box ${isError ? 'error' : 'success'}`;
    element.textContent = text;
    element.style.display = "block";
  };

  // Sign Up Form Handling
  const signupForm = document.getElementById("signupForm");
  const signupMessage = document.getElementById("signupMessage");
  const signupBtnSubmit = document.getElementById("signupBtn");

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const firstName = document.getElementById("firstName")?.value.trim();
      const lastName = document.getElementById("lastName")?.value.trim();
      const email = document.getElementById("signupEmail")?.value.trim();
      const pass = document.getElementById("signupPassword")?.value;
      const confirmPass = document.getElementById("confirmPassword")?.value;

      if (!firstName || !lastName || !email || !pass) {
        return showMessage(signupMessage, "Please fill in all required fields.", true);
      }

      if (pass !== confirmPass) {
        return showMessage(signupMessage, "Passwords do not match!", true);
      }

      if (pass.length < 6) {
        return showMessage(signupMessage, "Password must be at least 6 characters long.", true);
      }

      if (signupBtnSubmit) {
        signupBtnSubmit.disabled = true;
        const span = signupBtnSubmit.querySelector("span");
        if (span) span.textContent = "Creating Account...";
      }

      try {
        const fullName = `${firstName} ${lastName}`.trim();
        
        if (!supabase) throw new Error("Supabase is not initialized.");

        // 1. Supabase Auth Sign Up
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: pass,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              full_name: fullName
            }
          }
        });

        if (error) throw error;

        // 2. Insert User Details into Custom Table
        if (data?.user) {
          await supabase.from('users').insert([
            {
              name: fullName,
              email: email,
              role: 'member'
            }
          ]);
        }

        showMessage(signupMessage, "Registration successful! You can now log in.");
        signupForm.reset();
        if (strengthBar) strengthBar.style.width = "0%";

        setTimeout(() => {
          container.classList.remove("right-panel-active");
          if (signupMessage) signupMessage.style.display = "none";
        }, 1500);

      } catch (err) {
        showMessage(signupMessage, err.message || "Failed to register. Please try again.", true);
      } finally {
        if (signupBtnSubmit) {
          signupBtnSubmit.disabled = false;
          const span = signupBtnSubmit.querySelector("span");
          if (span) span.textContent = "Sign Up";
        }
      }
    });
  }

  // Sign In Form Handling
  const signinForm = document.getElementById("signinForm");
  const signinMessage = document.getElementById("signinMessage");
  const signinBtnSubmit = document.getElementById("signinBtn");

  if (signinForm) {
    signinForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const email = document.getElementById("signinEmail")?.value.trim();
      const pass = document.getElementById("signinPassword")?.value;

      if (!email || !pass) {
        return showMessage(signinMessage, "Please enter both email and password.", true);
      }

      if (signinBtnSubmit) {
        signinBtnSubmit.disabled = true;
        const span = signinBtnSubmit.querySelector("span");
        if (span) span.textContent = "Signing In...";
      }

      try {
        if (!supabase) throw new Error("Supabase is not initialized.");

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: pass
        });

        if (error) throw error;

        showMessage(signinMessage, "Sign in successful! Redirecting...");
        
        setTimeout(() => {
          window.location.reload();
        }, 1200);

      } catch (err) {
        showMessage(signinMessage, err.message || "Invalid login credentials.", true);
      } finally {
        if (signinBtnSubmit) {
          signinBtnSubmit.disabled = false;
          const span = signinBtnSubmit.querySelector("span");
          if (span) span.textContent = "Sign In";
        }
      }
    });
  }

  // Check Active Session
  const checkSession = async () => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log("Logged in user:", session.user);
    }
  };

  checkSession();
});