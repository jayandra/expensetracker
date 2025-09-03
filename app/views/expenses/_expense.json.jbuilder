json.extract! expense, :id, :amount, :description, :category_id, :date
json.url expense_url(expense, format: :json)
