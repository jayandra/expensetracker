class Expense < ApplicationRecord
  belongs_to :category

  validates :amount, :category, :date, presence: true
end
