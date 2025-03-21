# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
user = User.create(email_address: "test@test.com", password: "password")
grocery = Category.create(name: "Grocery", user: user)
Category.create(name: "Walmart", parent_id: grocery.id)
Category.create(name: "Aldi", parent_id: grocery.id)
Category.create(name: "Costco", parent_id: grocery.id)
Category.create(name: "Target", parent_id: grocery.id)

utility = Category.create(name: "Utilities", user: user)
water = Category.create(name: "Water", parent_id: utility.id)
Category.create(name: "Electricity", parent_id: utility.id)
Category.create(name: "Internet", parent_id: utility.id)
Category.create(name: "Phone", parent_id: utility.id)

Category.create(name: "Tap", parent_id: water.id)
Category.create(name: "Bottled", parent_id: water.id)
Category.create(name: "Jar", parent_id: water.id)
