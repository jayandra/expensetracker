class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy
  has_many :categories
  has_many :expenses, through: :categories

  validates :email_address, presence: true, uniqueness: true
  normalizes :email_address, with: ->(e) { e.strip.downcase }

  def demo_user
    email_address == "demo_user@example.com"
  end
end
