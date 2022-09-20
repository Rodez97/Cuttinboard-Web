import { Auth } from "@cuttinboard/cuttinboard-library";
import "@testing-library/jest-dom/extend-expect";
import { signOut } from "firebase/auth";
import puupeter from "puppeteer";

const baseURL = "http://localhost:3000";

describe("Login", () => {
  let browser: puupeter.Browser;
  let page: puupeter.Page;

  beforeAll(async () => {
    await signOut(Auth);
    browser = await puupeter.launch({ headless: true });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
  });

  test("Login error required fields", async () => {
    let invalidEmail: string;
    let invalidPassword: string;
    await page.goto(baseURL);
    await page.waitForSelector(".form-header");

    await page.click(".form-submit-button");
    await page.click(".form-submit-button");

    invalidEmail = await page.$eval(".form-input__email input", (e) =>
      e.getAttribute("aria-invalid")
    );

    expect(invalidEmail).toBe("true");

    await page.click(".form-input__email");
    await page.type(".form-input__email", "alexdrodez@gmail.com");

    await page.click(".form-submit-button");
    await page.click(".form-submit-button");

    invalidPassword = await page.$eval(".form-input__password input", (e) =>
      e.getAttribute("aria-invalid")
    );

    expect(invalidPassword).toBe("true");

    await page.click(".form-input__password");
    await page.type(".form-input__password", "xxxxxx");

    await page.click(".form-submit-button");

    invalidEmail = await page.$eval(".form-input__email input", (e) =>
      e.getAttribute("aria-invalid")
    );

    invalidPassword = await page.$eval(".form-input__password input", (e) =>
      e.getAttribute("aria-invalid")
    );

    expect(invalidEmail).toBe("false");
    expect(invalidPassword).toBe("false");
  });

  test("Login error wrong password", async () => {
    await page.goto(baseURL);
    await page.waitForSelector(".form-header");

    await page.click(".form-input__email");
    await page.type(".form-input__email", "alexdrodez@gmail.com");

    await page.click(".form-input__password");
    await page.type(".form-input__password", "xxxxxx");

    await page.screenshot({ path: "beforeSubmitError.png" });

    await page.click(".form-submit-button");

    await page.waitForSelector(".form-error-text");

    const text = await page.$eval(".form-error-text", (e) => e.textContent);

    await page.screenshot({ path: "afterSubmitError.png" });

    expect(text).toBe("Wrong password");
  });

  test("Login error user not found", async () => {
    await page.goto(baseURL);
    await page.waitForSelector(".form-header");

    await page.click(".form-input__email");
    await page.type(".form-input__email", "ejemplo@gmail.com");

    await page.click(".form-input__password");
    await page.type(".form-input__password", "xxxxxx");

    await page.screenshot({ path: "beforeWrongEmail.png" });

    await page.click(".form-submit-button");

    await page.waitForSelector(".form-error-text");

    const text = await page.$eval(".form-error-text", (e) => e.textContent);

    await page.screenshot({ path: "afterWrongEmail.png" });

    expect(text).toBe("User not found");
  });

  test("Login error wrong email format", async () => {
    await page.goto(baseURL);
    await page.waitForSelector(".form-header");

    await page.click(".form-input__email");
    await page.type(".form-input__email", "alexdrodezgmail.com");

    await page.click(".form-input__password");
    await page.type(".form-input__password", "xxxxxx");

    await page.waitForSelector(".form-input__email .MuiFormHelperText-root", {
      visible: true,
    });

    const text = await page.$eval(
      ".form-input__email .MuiFormHelperText-root",
      (e) => e.textContent
    );

    expect(text).toBe("Must be a valid email");
  });

  test("Go to register page and back", async () => {
    await page.goto(baseURL);
    await page.waitForSelector("#registerButton");

    const registerBtn = await page.$eval("#registerButton", (e) =>
      e.getAttribute("href")
    );

    expect(registerBtn).toBe("/register");

    await Promise.all([
      page.click("#registerButton"),
      page.waitForNavigation(),
    ]);

    await page.waitForSelector("#loginButton");

    const loginBtn = await page.$eval("#loginButton", (e) =>
      e.getAttribute("href")
    );

    expect(loginBtn).toBe("/login");

    expect(page.url()).toBe(`${baseURL}/register`);

    await Promise.all([page.click("#loginButton"), page.waitForNavigation()]);

    expect(page.url()).toBe(`${baseURL}/login`);
  });

  test("Successfully login and navigate to Dashboard", async () => {
    await page.goto(baseURL);
    await page.waitForSelector(".form-header");

    await page.click(".form-input__email");
    await page.type(".form-input__email", "alexdrodez@gmail.com");

    await page.click(".form-input__password");
    await page.type(".form-input__password", "Zedor7990");

    await page.screenshot({ path: "beforeSubmitLogin.png" });

    await Promise.all([
      page.click(".form-submit-button"),
      new Promise((r) => setTimeout(r, 3000)),
    ]);

    await page.screenshot({ path: "afterSubmitLogin.png" });

    expect(page.url()).toContain("dashboard");
  });

  afterAll(() => browser.close());
});
