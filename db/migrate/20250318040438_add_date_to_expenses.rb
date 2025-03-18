class AddDateToExpenses < ActiveRecord::Migration[8.0]
  def change
    add_column :expenses, :date, :datetime
  end
end
