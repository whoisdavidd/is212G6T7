from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


options = Options()
options.add_experimental_option("detach", True)
options.add_argument("--no-sandbox")  # Avoid sandboxing issues
options.add_argument("--disable-dev-shm-usage")  # Useful for Docker environments
options.add_argument("--headless")  # Run browser in headless mode (optional)



driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

driver.get("https://worknest-five.vercel.app/")
driver.maximize_window()

try:
    # Wait until the username input field is present (up to 10 seconds)
    username_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//input[@id='Email' or @placeholder='Email']"))
    )
    username_input.send_keys("admin@allinone.com.sg")  # Replace with actual username

    # Wait until the password input field is present
    password_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//input[@id='Password' or @placeholder='Password']"))
    )
    password_input.send_keys("admin")  # Replace with actual password

    # Wait until the login button is clickable and click it
    login_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
    )
    login_button.click()

    # Optional: Add a small delay to let the page load after login
    WebDriverWait(driver, 10).until(
        EC.url_contains("dashboard")  # Adjust the condition based on your site’s post-login behavior
    )
    print("Login successful!")

except Exception as e:
    print(f"An error occurred: {type(e).__name__} - {e}")

finally:
    # Optional: Close the browser
    driver.quit()