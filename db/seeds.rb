# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

3.times do |i|
  user = User.create(email_address: "test_#{i}@test.com", password: "password")

  grocery = Category.create(name: "Grocery", user: user)
  Category.create(name: "Walmart", parent_id: grocery.id)
  Category.create(name: "Aldi", parent_id: grocery.id)
  Category.create(name: "Costco", parent_id: grocery.id)
  Category.create(name: "Target", parent_id: grocery.id)

  utility = Category.create(name: "Utilities", user: user)
  Category.create(name: "Electricity", parent_id: utility.id)
  Category.create(name: "Internet", parent_id: utility.id)
  Category.create(name: "Phone", parent_id: utility.id)

  water = Category.create(name: "Water", parent_id: utility.id)
  Category.create(name: "Tap", parent_id: water.id)
  Category.create(name: "Bottled", parent_id: water.id)
  Category.create(name: "Jar", parent_id: water.id)

  Expense.create(amount: 10+i, description: "Expense for category #{grocery.id}", category_id: grocery.id, date: Date.today)
  Expense.create(amount: 20+i, description: "Expense for category #{utility.id}", category_id: utility.id, date: Date.today)
  Expense.create(amount: 1+i, description: "Expense for category #{water.id}", category_id: water.id, date: Date.today)
end


