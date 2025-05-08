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


variable "db_username"{
  type = string
}
variable "db_password"{
  type = string
}
variable "db_name"{
  type = string
}


variable "rails_secret_key_base"{
  type = string
}
