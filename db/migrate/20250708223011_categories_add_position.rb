class CategoriesAddPosition < ActiveRecord::Migration[8.0]
  def change
    add_column :categories, :position, :integer
  end
end
