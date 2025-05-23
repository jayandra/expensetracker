variable "project_name" {
  description = "The name of the project"
  type        = string
  default     = "expense-tracker"
}

variable "aws_region" {
    description = "Default aws region"
    type        = string
    default     = "us-east-1"
}

variable "disable_async_jobs" {
    description = "Controls if jobs are done synchronously or asynchronously"
    type        = bool
    default     = false
}


variable "db_username"{
  type = string
}
variable "db_password"{
  type = string
}
variable "db_name"{
  type = string
}


variable "rails_master_key"{
  type = string
}
variable "mailer_host"{
  type = string
}
