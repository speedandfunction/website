# Setting Up Google Sheets API with a Service Account

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing project.

## Step 2: Enable Google Sheets API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**.
2. Search for **Google Sheets API**.
3. Click on it, then click **Enable**.

## Step 3: Create a Service Account

1. Go to **APIs & Services** > **Credentials** in your Google Cloud project.
2. Click **Create Credentials**, then select **Service Account**.
3. Provide a name and description for the service account, then click **Create and Continue**.
4. Grant the service account access to the project by selecting **Editor** (or a more limited role if you prefer) and then click **Continue**.
5. Click **Done** to finish creating the service account.

## Step 4: Create a Key for the Service Account

1. In the **Credentials** page, find the service account you just created.
2. Click on the service account name, then go to the **Keys** tab.
3. Click **Add Key** > **Create New Key**.
4. Choose **JSON** as the key type, then click **Create**. A JSON file will download to your computer. This is your service account key file, which you’ll need for your code.

## Step 5: Share the Google Spreadsheet with the Service Account

1. Open the Google Spreadsheet you want to access.
2. Click **Share** in the top right corner.
3. In the "Share with people and groups" dialog, enter the service account's email address (it should look something like `your-service-account@your-project-id.iam.gserviceaccount.com`).
4. Click **Send** (no email will actually be sent, but this allows the service account to access the spreadsheet).

## Step 6: Use the Service Account Key File in to fill the Google Spreadsheet tab in configurations of certain form.
