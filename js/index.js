let translations;
let lang = 'en'; // o 'es'

const loadTranslations = async () => {
  try {
    const res = await fetch(`lang/${lang}.json`);
    translations = await res.json();
  } catch (error) {
    console.error(`${lang}.json was not found`, error);
    translations = {};
  }
};

// Función para obtener claves anidadas tipo "a.b[0].c"
const __ = (key) => {
  if (!translations) return key;

  const path = key.replace(/\[(\d+)\]/g, '.$1').split('.');
  return path.reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : key, translations);
};

const renderObject = (key, object) => {
  let str = `
    <div class="col-12 divider">
      <span class="divider-text">
        ${object.title}
      </span>
    </div>
  `;

  switch (key) {
    case "profile":
    case "hobbies":
    case "softSkills":
      str += `
        <div class="col-12">
          ${object.data}
        </div>
      `;
      break;
    case "education":
      str += `
        <div class="col-12">
          <div class="timeline-entry">
            <span class="left">${object.data.school}</span>
            <span class="dots"></span>
            <span class="right">${object.data.time}</span>
          </div>
        </div>
        <div class="col-12 col-sm-6">${object.data.field}</div>
        <div class="col-12 col-sm-6 text-end">${object.data.city}</div>
        <div class="col-12 col-sm-6">${object.data.graduation}</div>
        <div class="col-12">${object.data.description}</div>
      `;
      break;
    case "hardSkills":
    case "languages":
      object.data.forEach(skill => {
        str += `
          <div class="col-12 col-sm-6">
            <div class="timeline-entry">
              <span class="left">${skill.title}</span>
              <span class="dots"></span>
              <span class="right">${skill.description}</span>
            </div>
          </div>
        `;
      });
      break;
    case "workHistory":
      object.data.forEach((work, i) => {
        str += `
          <div class="col-12 ${i > 0? "mt-1":""}">
            <div class="timeline-entry">
              <span class="left">${work.position}</span>
              <span class="dots"></span>
              <span class="right">${work.time}</span>
            </div>
          </div>

          <div class="col-12">
            <b>${work.at}</b> - ${work.address} ${work.remote? "(Remote)" : ""}
          </div>

          <div class="col-12">
            ${work.description}
          </div>
        `;
      });
      break;
  }
  return str;
};

const changeLanguage = async (langCode = 'en') => {
  const root = document.getElementById('i18n-root');

  // Paso 1: fade-out
  root.classList.add('fade-out');

  // Espera que termine la animación de salida
  await new Promise(resolve => setTimeout(resolve, 300)); // igual al tiempo del CSS

  // Paso 2: cambiar idioma y contenido
  lang = langCode;
  localStorage.setItem('lang', langCode);
  await loadTranslations();

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    let value = __(key);
    const isHtml = /<[a-z][\s\S]*>/i.test(value);
    const isObject = typeof value == "object";

    if (isObject) {
      value = renderObject(key, value);
    }

    if (isHtml || isObject) {
      el.innerHTML = value;
    } else {
      el.textContent = value;
    }
  });

  // Paso 3: fade-in
  root.classList.remove('fade-out');
  root.classList.add('fade-in');

  // Limpia la clase después de la animación para que pueda repetirse
  setTimeout(() => {
    root.classList.remove('fade-in');
  }, 300);
};


window.addEventListener('DOMContentLoaded', async () => changeLanguage());