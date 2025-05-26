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
variable "aws_profile" {
    description = "AWS sso profile"
    type        = string
}
variable "ami_id"{
  description = "Amazon Machine image for amazon linux"
  type = string
  default = "ami-02457590d33d576c3"
}
variable "ssh_public_key_path" {
  description = "Path to the SSH public key to import"
  type        = string
  default     = "~/.ssh/id_rsa.pub"  # change as needed
}

variable "ssh_key_pair_name" {
  description = "Name of the AWS key pair to create/use"
  type        = string
  default     = "expensetracker-keypair"
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
variable "disable_async_jobs" {
    description = "Controls if jobs are done synchronously or asynchronously"
    type        = bool
    default     = false
}