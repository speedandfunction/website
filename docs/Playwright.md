## 📁 Recommended Project Structure

<details>
<summary>Project Structure Example</summary>

```
project-root/
├── e2e/                     # E2E testing directory
│   ├── pages/               # Page Object Model classes
│   │   ├── LoginPage.ts
│   │   └── DashboardPage.ts
│   ├── components/          # Component Object Model classes
│   │   ├── HeaderComponent.ts
│   │   └── ModalComponent.ts
│   ├── utils/               # Helper functions and utilities
│   │   ├── userFactory.ts
│   │   └── helpers.ts
│   ├── specs/               # Test specifications
│   │   ├── login.spec.ts
│   │   └── dashboard.spec.ts
│   ├── data/                # Test data (JSON, mock data, etc.)
│   │   └── users.json
│   ├── fixtures/            # Playwright fixtures and test setup
│   │   └── testSetup.ts
│   ├── playwright.config.ts # Playwright configuration
│   └── tsconfig.json        # TypeScript configuration
├── config/                  # Optional: custom configuration files
│   └── env.ts
└── reports/                 # Optional: test reports and artifacts
    └── index.html
```
</details>

---

## 🧱️ Design Patterns in E2E Testing

### 1. Page Object Model (POM)

Encapsulates page structure and behavior.

<details>
<summary>LoginPage POM Example</summary>

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
</details>

**Best Practices (with examples):**

* **Write one class per page to maintain separation of concerns.**

  <details>
  <summary>❌ Bad practice:</summary>

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
  // login.spec.ts
  describe('Login', () => {
    const loginAndDashboardPage = new LoginAndDashboardPage();
    
    it('should login successfully', async () => {
      await loginAndDashboardPage.login('user', 'password');
      await loginAndDashboardPage.waitForWelcomeMessage();
    });
  });
  ```
  </details>

  <details>
  <summary>✅ Good practice:</summary>

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

  // e2e/specs/login.spec.ts
  describe('Login', () => {
    const loginPage = new LoginPage();
    const dashboardPage = new DashboardPage();
    
    it('should login successfully', async () => {
      await loginPage.login('user', 'password');
      await dashboardPage.waitForWelcomeMessage();
    });
  });
  ```
  </details>

* **Write assertions in test files, not in page files.**

  <details>
  <summary>❌ Bad practice:</summary>

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
    async assertLoginError() {
      await expect(this.page.locator('.error')).toBeVisible();
    }
  }

  // Example usage in test:
  test('should show error on invalid login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('invalid', 'wrong');
    await expect(page.locator('.error')).toBeVisible();
  });

  ```
  </details>

  <details>
  <summary>✅ Good practice:</summary>

  ```ts
  // e2e/specs/login.spec.ts
  import { test, expect } from '@playwright/test';
  import { LoginPage } from '../pages/LoginPage';

  test('User can log in successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('user', 'pass');
    await expect(loginPage.welcomeMessage).toHaveText('Welcome');
  });
  ```
  </details>

* **Reuse page classes across test specs for consistency and maintainability.**

  <details>
  <summary>❌ Bad practice:</summary>

  ```ts
  // login.spec.ts
  import { test, expect } from '@playwright/test';

  test('User can log in', async ({ page }) => {
    await page.goto('https://example.com/login');
    await page.fill('#username', 'user1');
    await page.fill('#password', 'pass1');
    await page.click('button');
    await expect(page.locator('h1')).toBeVisible();
  });

  // dashboard.spec.ts
  import { test, expect } from '@playwright/test';

  test('User can access dashboard after login', async ({ page }) => {
    await page.goto('https://example.com/login');
    await page.fill('#username', 'user2');
    await page.fill('#password', 'pass2');
    await page.click('button');
    await expect(page.locator('#dashboard-title')).toBeVisible();
  });
  ```
  </details>

  <details>
  <summary>✅ Good practice:</summary>

  ```ts
  // LoginPage.ts
  import { Page } from '@playwright/test';

  export class LoginPage {
    constructor(private page: Page) {}
    
    async navigate() {
      await this.page.goto('https://example.com/login');
    }

    async login(username: string, password: string) {
      await this.page.fill('#username', username);
      await this.page.fill('#password', password);
      await this.page.click('button');
    }
  }

  // e2e/specs/login.spec.ts
  import { test, expect } from '@playwright/test';
  import { LoginPage } from '../pages/LoginPage';

  test('User can log in', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('user1', 'pass1');
    await expect(page.locator('h1')).toBeVisible();
  });

  // dashboard.spec.ts
  import { test, expect } from '@playwright/test';
  import { LoginPage } from '../pages/LoginPage';
  import { DashboardPage } from '../pages/DashboardPage';

  test('User can access dashboard after login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    await loginPage.navigate();
    await loginPage.login('user2', 'pass2');
    await expect(dashboardPage.title).toBeVisible();
  });
  ```
  </details>

**Caveats:**

* Can grow large → split into sub-components (e.g., popups, sections).
* Avoid mixing business logic or data dependencies inside page classes.

---

### 2. Component Object Model (COM)

Used for reusable components like headers/modals.

<details>
<summary>HeaderComponent Example</summary>

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
</details>

**Best Practices:**

* Reuse across multiple POMs.
* Keep components small and isolated.

**Example Usage:**

<details>
<summary>❌ Bad practice:</summary>

```ts
// dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('User can logout from dashboard', async ({ page }) => {
  await page.goto('https://example.com/dashboard');
  // Directly interact with the header in the test
  await page.click('#profile');
  await page.click('#logout');
  await expect(page.locator('h1')).toHaveText('Login');
});
```
</details>

<details>
<summary>✅ Good practice:</summary>

```ts
// HeaderComponent.ts
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

// DashboardPage.ts
import { Page } from '@playwright/test';
import { HeaderComponent } from '../components/HeaderComponent';

export class DashboardPage {
  readonly header: HeaderComponent;
  
  constructor(private page: Page) {
    this.header = new HeaderComponent(page);
  }
  
  async navigate() {
    await this.page.goto('https://example.com/dashboard');
  }
}

// dashboard.spec.ts
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';

test('User can logout from dashboard', async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  const loginPage = new LoginPage(page);
  
  await dashboardPage.navigate();
  await dashboardPage.header.clickProfile();
  await dashboardPage.header.logout();
  
  await expect(loginPage.pageTitle).toHaveText('Login');
});
```
</details>

**Caveats:**

* Group related components into subdirectories if the count grows large.

---

### 3. Factory Pattern

Used to dynamically generate test data.

<details>
<summary>User Factory Example</summary>

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
</details>

**Best Practices:**

* Avoid hardcoding data.
* Centralize factory logic to simplify test data management.

**Example Usage:**

<details>
<summary>❌ Bad practice:</summary>

```ts
// login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('Admin can log in successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  
  // Hardcoded test data
  await loginPage.login('admin123', 'AdminPassword123!');
  
  await expect(page.locator('#admin-dashboard')).toBeVisible();
});

test('Regular user can log in successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  
  // Duplicated hardcoded test data
  await loginPage.login('user567', 'UserPassword456!');
  
  await expect(page.locator('#user-dashboard')).toBeVisible();
});
```
</details>

<details>
<summary>✅ Good practice:</summary>

```ts
// userFactory.ts
export function createUser(role: string) {
  const baseUser = {
    username: `user_${Math.random().toString(36).substring(2, 15)}`,
    password: 'Password123!',
    role,
  };
  
  if (role === 'admin') {
    return {
      ...baseUser,
      permissions: ['read', 'write', 'delete'],
      department: 'IT',
    };
  }
  
  return {
    ...baseUser,
    permissions: ['read'],
    department: 'Marketing',
  };
}

// login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { createUser } from '../utils/userFactory';

test('Admin can log in successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const adminUser = createUser('admin');
  
  await loginPage.navigate();
  await loginPage.login(adminUser.username, adminUser.password);
  
  await expect(page.locator('#admin-dashboard')).toBeVisible();
});

test('Regular user can log in successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const regularUser = createUser('user');
  
  await loginPage.navigate();
  await loginPage.login(regularUser.username, regularUser.password);
  
  await expect(page.locator('#user-dashboard')).toBeVisible();
});
```
</details>

**Caveats:**

* Keep factory functions simple and easily adaptable.

---

### 4. Singleton Pattern

Useful for managing shared resources.

<details>
<summary>Database Singleton Example</summary>

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
</details>

**Best Practices:**

* Use singletons for shared resource management like database or API clients.
* Ensure isolation between tests by resetting or mocking the singleton where needed.

**Example Usage:**

<details>
<summary>❌ Bad practice:</summary>

```ts
// db-util.ts
export const connectToDatabase = async () => {
  // Create new connection each time
  return new SQLDatabase('connection-string');
};

// test1.spec.ts
import { test } from '@playwright/test';
import { connectToDatabase } from '../utils/db-util';

test('Test 1 with DB connection', async () => {
  const db = await connectToDatabase(); // Creates new connection
  // Test logic...
});

// test2.spec.ts
import { test } from '@playwright/test';
import { connectToDatabase } from '../utils/db-util';

test('Test 2 with DB connection', async () => {
  const db = await connectToDatabase(); // Creates another new connection
  // Test logic...
});
```
</details>

<details>
<summary>✅ Good practice:</summary>

```ts
// e2e/utils/database.ts
export class Database {
  private static instance: Database;
  private connection: any;

  private constructor() {
    // Initialize connection
    this.connection = null;
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect() {
    if (!this.connection) {
      this.connection = await createConnection();
    }
    return this.connection;
  }

  async reset() {
    // Reset database state between tests
  }
}

// e2e/fixtures/fixtures.ts
import { test as base } from '@playwright/test';
import { Database } from '../utils/database';

export const test = base.extend({
  database: async ({}, use) => {
    const db = Database.getInstance();
    await db.connect();
    
    // Before test: reset DB state
    await db.reset();
    
    // Use the database in the test
    await use(db);
    
    // After test: no need to close, maintained by singleton
  }
});

// e2e/specs/test1.spec.ts
import { test } from '../fixtures/fixtures';

test('Test 1 with DB fixture', async ({ database }) => {
  // Test uses the shared database instance
  await database.executeQuery('SELECT * FROM users');
});

// e2e/specs/test2.spec.ts
import { test } from '../fixtures/fixtures';

test('Test 2 with DB fixture', async ({ database }) => {
  // Test uses the same shared database instance
  await database.executeQuery('SELECT * FROM products');
});
```
</details>

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