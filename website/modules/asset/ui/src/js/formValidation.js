import * as yup from 'yup';

// Основні схеми валідації для різних типів полів
const validationSchemas = {
  text: yup
    .string()
    .min(2, 'Поле повинно містити мінімум 2 символи')
    .max(50, 'Поле не може бути довшим за 50 символів')
    .required("Це поле обов'язкове"),

  email: yup
    .string()
    .email('Введіть коректну email адресу')
    .required("Email обов'язковий"),
};

// // Спеціальні валідаційні схеми для конкретних полів за їх іменами
// Const fieldSpecificSchemas = {
//   'full-name': yup
//     .string()
//     .min(2, "Ім'я повинно містити мінімум 2 символи")
//     .max(50, "Ім'я не може бути довшим 50 символів")
//     .required("Ім'я обов'язкове"),
//   'email-address': yup
//     .string()
//     .email('Введіть коректну email адресу')
//     .required("Email обов'язковий"),
// };

// // Функція для валідації конкретного поля
// Const validateField = async (field, value) => {
//   Try {
//     Const fieldName = field.getAttribute('name');
//     // Визначаємо тип поля
//     Let fieldType = field.getAttribute('type');
//     If (!fieldType) {
//       If (field.tagName.toLowerCase() === 'textarea') {
//         FieldType = 'textarea';
//       } else {
//         FieldType = 'text';
//       }
//     }

/*
 *     // Визначаємо, яку схему використовувати - спеціальну за іменем або загальну за типом
 *     let schema = fieldSpecificSchemas[fieldName];
 *     if (!schema) {
 *       schema = validationSchemas[fieldType] || validationSchemas.text;
 *     }
 */

/*
 *     // Якщо поле не обов'язкове і порожнє, пропускаємо валідацію
 *     if (!field.hasAttribute('required') && (!value || value.trim() === '')) {
 *       return { isValid: true };
 *     }
 */

/*
 *     // Виконуємо валідацію
 *     await schema.validate(value);
 *     return { isValid: true };
 *   } catch (error) {
 *     return { isValid: false, message: error.message };
 *   }
 * };
 */

// Функція для показу помилки валідації
const showValidationError = (field, message) => {
  // Знаходимо батьківський елемент поля
  const wrapper = field.closest('.apos-form-input-wrapper');
  if (!wrapper) return;

  // Перевіряємо, чи вже є елемент для помилки
  let errorElement = wrapper.querySelector('.validation-error');

  // Якщо елемент помилки не існує, створюємо його
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'validation-error';

    // Додаємо після поля або його label
    const label = wrapper.querySelector('label');
    if (label && label.nextSibling) {
      wrapper.insertBefore(errorElement, label.nextSibling);
    } else {
      wrapper.appendChild(errorElement);
    }
  }

  // Встановлюємо текст помилки
  errorElement.textContent = message;

  // Додаємо клас помилки до поля
  field.classList.add('has-error');
};

// Функція для очищення помилок валідації
const clearValidationError = (field) => {
  // Знаходимо батьківський елемент поля
  const wrapper = field.closest('.apos-form-input-wrapper');
  if (!wrapper) return;

  // Знаходимо і видаляємо елемент помилки
  const errorElement = wrapper.querySelector('.validation-error');
  if (errorElement) {
    errorElement.textContent = '';
  }

  // Видаляємо клас помилки з поля
  field.classList.remove('has-error');
};

// Додавання обробників подій для одного поля
const addFieldValidationHandlers = (field) => {
  // Пропускаємо кнопки та приховані поля
  if (
    field.type === 'submit' ||
    field.type === 'button' ||
    field.type === 'hidden'
  ) {
    return;
  }

  // Валідація при втраті фокуса
  field.addEventListener('blur', async (event) => {
    const result = await validateField(event.target, event.target.value);
    if (result.isValid) {
      clearValidationError(event.target);
    } else {
      showValidationError(event.target, result.message);
    }
  });

  // Очищення помилки при введенні
  field.addEventListener('input', (event) => {
    clearValidationError(event.target);
  });
};

// Обробник події submit для форми
const handleFormSubmit = (form) => async (event) => {
  // Запобігаємо стандартній відправці форми
  event.preventDefault();

  // Валідуємо форму
  const isValid = await validateForm(form);

  if (isValid) {
    // Якщо валідація пройшла успішно, відправляємо форму
    form.submit();
  }
};

// Функція для валідації всієї форми
const validateForm = async (form) => {
  const fields = form.querySelectorAll('input, textarea, select');
  let isFormValid = true;

  // Очищаємо всі попередні помилки
  fields.forEach((field) => {
    clearValidationError(field);
  });

  // Перевіряємо кожне поле
  for (const field of fields) {
    // Пропускаємо кнопки та приховані поля
    if (
      field.type === 'submit' ||
      field.type === 'button' ||
      field.type === 'hidden'
    ) {
      // eslint-disable-next-line no-continue
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const result = await validateField(field, field.value);
    if (!result.isValid) {
      showValidationError(field, result.message);
      isFormValid = false;
    }
  }

  return isFormValid;
};

// Ініціалізація форми з валідацією
const initFormWithValidation = (form) => {
  // Додаємо обробник події submit
  form.addEventListener('submit', handleFormSubmit(form));

  // Додаємо валідацію до кожного поля
  const fields = form.querySelectorAll('input, textarea, select');
  fields.forEach(addFieldValidationHandlers);
};

// Ініціалізація валідації для всіх форм
const initFormValidation = () => {
  document.addEventListener('DOMContentLoaded', () => {
    // Знаходимо всі форми з класом sf-form
    const forms = document.querySelectorAll('.sf-form');
    forms.forEach(initFormWithValidation);
  });
};

// Експортуємо функцію ініціалізації
export { initFormValidation };
