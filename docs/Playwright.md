## 📁 Recommended Project Structure (with POM & COM folders under `tests/`)

```
project-root/
├── tests/                   # Test specifications
│   ├── login.spec.ts
│   └── dashboard.spec.ts
├── pom/                     # Page Object Model classes
│   ├── LoginPage.ts
│   └── DashboardPage.ts
├── com/                     # Component Object Model classes
│   ├── HeaderComponent.ts
│   └── ModalComponent.ts
├── utils/                   # Helper functions and utilities
│   ├── userFactory.ts
│   └── helpers.ts
├── data/                    # Test data (JSON, mock data, etc.)
│   └── users.json
├── fixtures/                # Playwright fixtures and test setup
│   └── testSetup.ts
├── config/                  # Optional: custom configuration files
│   └── env.ts
├── reports/                 # Optional: test reports and artifacts
│   └── index.html
├── playwright.config.ts     # Playwright configuration
└── tsconfig.json 
```

---

## 🧱️ Design Patterns in E2E Testing

### 1. Page Object Model (POM)

Encapsulates page structure and behavior.

```ts
// e2e/pages/LoginPage.ts
import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('https://example.com/login');
  }

  async login(username: string, password: string) {
    await this.page.fill('#username', username);
    await this.page.fill('#password', password);
    await this.page.click('button[type="submit"]');
  }

  public get welcomeMessage() {
    return this.page.locator('h1');
  }
}
```

**Best Practices (with examples):**

* **Write one class per page to maintain separation of concerns.**

  ❌ **Bad practice:**

  ```ts
  // LoginAndDashboardPage.ts
  import { Page } from '@playwright/test';

  class LoginAndDashboardPage {
    constructor(private page: Page) {}

    async waitForWelcomeMessage() {
      await this.page.waitForSelector('h1');
    }
    
    async login(username: string, password: string) {
      await this.page.fill('#username', username);
      await this.page.fill('#password', password);
      await this.page.click('button');
    }
  }
  // LoginTest.ts
  class LoginTest {
    const loginAndDashboardPage = new LoginAndDashboardPage();
    aysnc testLogin() {
      await loginAndDashboardPage.login('user', 'password');
      await loginAndDashboardPage.waitForWelcomeMessage()
      
    }
  }
  ```

  ✅ **Good practice:**

  ```ts
  // LoginPage.ts
  import { Page } from '@playwright/test';

  class LoginPage {
    constructor(private page: Page) {}

    async login(username: string, password: string) {
      await this.page.fill('#username', username);
      await this.page.fill('#password', password);
      await this.page.click('button');
    }
  }

  // DashboardPage.ts
  import { Page } from '@playwright/test';

  class DashboardPage {
    constructor(private page: Page) {}

    async waitForWelcomeMessage() {
      await this.page.waitForSelector('h1');
    }
  }

  // LoginTest.ts
  class LoginTest {
    const loginPage = new LoginAndDashboardPage();
    const dashboardPage = new DashboardPage();
    
    aysnc testLogin() {
      await loginAndDashboardPage.login('user', 'password');
      await loginAndDashboardPage.waitForWelcomeMessage()
      
    }
  }
  ```

* **Write assertions in test files, not in page files.**

  ❌ **Bad practice:**

  ```ts
  // LoginPage.ts
  import { Page, expect } from '@playwright/test';

  class LoginPage {
    constructor(private page: Page) {}

    async login(username: string, password: string) {
      await this.page.fill('#username', username);
      await this.page.fill('#password', password);
      await this.page.click('button');
    }

    async assertLoggedIn() {
      await expect(this.page.locator('h1')).toHaveText('Welcome');
    }
  }
  ```

  ✅ **Good practice:**

  ```ts
  // login.spec.ts
  import { test, expect } from '@playwright/test';
  import { LoginPage } from '../pages/LoginPage';

  test('User can log in successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('user', 'pass');
    await expect(loginPage.welcomeMessage).toHaveText('Welcome');
  });
  ```

* **Reuse page classes across test specs for consistency and maintainability.**

  ❌ **Bad practice:**

  ```ts
  // login.spec.ts
  await page.fill('#username', 'user');
  await page.fill('#password', 'pass');
  await page.click('button');
  ```

  ✅ **Good practice:**

  ```ts
  // login.spec.ts
  import { LoginPage } from '../pages/LoginPage';

  const loginPage = new LoginPage(page);
  await loginPage.login('user', 'pass');
  ```

**Caveats:**

* Can grow large → split into sub-components (e.g., popups, sections).
* Avoid mixing business logic or data dependencies inside page classes.

---

### 2. Component Object Model (COM)

Used for reusable components like headers/modals.

```ts
// e2e/components/HeaderComponent.ts
import { Page } from '@playwright/test';

export class HeaderComponent {
  constructor(private page: Page) {}

  async clickProfile() {
    await this.page.click('#profile');
  }

  async logout() {
    await this.page.click('#logout');
  }
}
```

**Best Practices:**

* Reuse across multiple POMs.
* Keep components small and isolated.

**Caveats:**

* Group related components into subdirectories if the count grows large.

---

### 3. Factory Pattern

Used to dynamically generate test data.

```ts
// e2e/utils/userFactory.ts
export function createUser(role: string) {
  return {
    username: `user_${Math.random().toString(36).substring(2, 15)}`,
    password: 'Password123!',
    role,
  };
}
```

**Best Practices:**

* Avoid hardcoding data.
* Centralize factory logic to simplify test data management.

**Caveats:**

* Keep factory functions simple and easily adaptable.

---

### 4. Singleton Pattern

Useful for managing shared resources.

```ts
// e2e/utils/database.ts
class Database {
  private static instance: Database;

  private constructor() {
    // Initialize connection
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // Methods for interaction...
}
```

**Best Practices:**

* Use singletons for shared resource management like database or API clients.
* Ensure isolation between tests by resetting or mocking the singleton where needed.

**Caveats:**

* Avoid leaking global state across tests; this can cause flakiness and dependency issues.

---

## ✅ Do's and ❌ Don'ts

**Do:**

* Use stable selectors (e.g., data-testid)
* Keep tests isolated
* Leverage fixtures
* Retry flaky tests

**Don't:**

* Hardcode test data
* Mix logic between POM and specs
* Use arbitrary waits (use auto-waiting)
* Ignore flaky tests


