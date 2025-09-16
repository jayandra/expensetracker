# README

[**Expense Tracker**](https://et.yoursolutionguy.com/session/new) is an app designed to help you keep track of your expenses. Whenever you make a transaction, you can open the installed PWA on your phone or visit it via a browser to add an entry. The app provides a simple and intuitive way to categorize your expenses such that at the end of the month (or whenever you want), you can generate a clear report of your spending during that period.

When a user signs up, a default set of categories is pre-populated to help them get started quickly.

### Running the app locally

- _Assuming you have PostgreSQL installed locally and its credentials are updated in `config/database.yml`:_

  ```
  git clone git@github.com:jayandra/expensetracker.git
  cd expensetracker
  bundle install
  rake db:create db:migrate db:seed
  foreman start -f procfile.dev
  ```
- The React frontend is located in the `frontend` directory. The `foreman` command mentioned above will concurrently run both Rails and React development servers. 
### Configure mailer:

- For simplicity, SMTP settings are been placed in `config/application.rb` and gets used across all environments.
- For production, it is recommended to override these settings by adding specific SMTP configurations in `config/environments/production.rb`, which will take precedence over those in application.rb.

### Deploy the app

- Provision AWS resources by running _(this need not be re-run once the resources are in place during the first)_:
  ```
  cd config/deploy/terraform
  terraform init
  terraform plan -var-file="production.tfvars"
  terraform apply -var-file="production.tfvars"
  ```
- Update the server's IP from above in `config/deploy.yml`, `config/deploy/terraform/production.tfvars` (mailer_host variable).
  Re-run `terraform apply  -var-file="production.tfvars"` for the secrets to be updated with the new value.
- Do a one-time setup and then deploy the app _(this is your go-to method to deploy the app)_:
  ```
  kamal setup
  kamal deploy

  # If not logged in, authenticate with AWS SSO and Docker:
  # 1. Log in to AWS SSO
  aws sso login --profile <your-profile-name>
  
  # 2. Authenticate Docker with AWS ECR
  aws ecr-public get-login-password --region us-east-1 --profile <your-profile-name> | \
    docker login --username AWS --password-stdin public.ecr.aws
  ```
  **NOTE**: If you want to deploy to ECS Fargate, refer [commit#637b49a](https://github.com/jayandra/expensetracker/commit/637b49a686f27b9d7fea75ea7c5e0f4b558b31b9) as starting point by revert it

### Background Job

- The app uses SolidQueue for background jobs.
- The `mission-control-jobs` gem is included to provide an interactive dashboard for queue status. You can access this dashboard at `<your-app-domain>/admin/jobs`.
- HTTP Basic Auth credentials for this dashboard can be viewed by running `rails credentials:show` or updated by running `rails credentials:edit`
