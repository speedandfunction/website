# CloudFront CDK

Цей проект використовує AWS CDK для розгортання CloudFront дистрибуції.

## Підготовка до розгортання

Для розгортання стеку вам потрібно налаштувати змінні оточення через `.env` файл.

### Налаштування .env файлу

1. Скопіюйте файл `.env.example` в `.env`:

   ```bash
   cp .env.example .env
   ```

2. Відредагуйте файл `.env` і вкажіть ваші значення:
   ```
   CDK_DEPLOY_ACCOUNT=123456789012  # Ваш AWS Account ID
   CDK_DEPLOY_REGION=us-east-1      # Бажаний регіон розгортання
   ```

Ваш ID акаунта можна отримати через AWS CLI:

```bash
aws sts get-caller-identity --query "Account" --output text
```

### Альтернативні способи налаштування

Якщо ви не хочете використовувати `.env` файл, ви також можете:

1. Використовувати AWS CLI профіль:

   ```bash
   aws configure
   ```

2. Встановити змінні оточення безпосередньо:
   ```bash
   export CDK_DEPLOY_ACCOUNT=123456789012
   export CDK_DEPLOY_REGION=us-east-1
   ```

## Команди

- `npm run build` - компіляція TypeScript
- `npm run watch` - відстеження змін та компіляція
- `npm run test` - запуск тестів
- `cdk deploy` - розгортання стеку
- `cdk diff` - порівняння поточного стану з локальною версією
- `cdk synth` - генерування CloudFormation шаблону
