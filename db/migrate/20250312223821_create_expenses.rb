class CreateExpenses < ActiveRecord::Migration[8.0]
  def change
    create_table :expenses do |t|
      t.float :amount
      t.text :description
      t.belongs_to :category, null: false, foreign_key: true

      t.timestamps
    end
  end
end
