class Category < ApplicationRecord
  belongs_to :parent, class_name: "Category", foreign_key: :parent_id, optional: true
  has_many :children, class_name: "Category", foreign_key: :parent_id, dependent: :destroy
  belongs_to :user
  has_many :expenses

  validates :name, presence: true
  validate :unique_name_for_user_and_parent
  validate :no_circular_dependency

  scope :roots, -> { where(parent_id: nil) }
  default_scope { order(:position) }

  def self.seed_category_for_new_user(user)
    grocery = user.categories.create!(name: "Grocery")
    user.categories.create!(name: "Walmart", parent: grocery)
    user.categories.create!(name: "Target", parent: grocery)
    user.categories.create!(name: "Aldi", parent: grocery)

    pharmacy = user.categories.create(name: "Pharmacy")
    user.categories.create(name: "CVS", parent: pharmacy)
    user.categories.create(name: "Walgreens", parent: pharmacy)
  end

  def ancestors
    result = []
    current = self.parent
    while current do
      result << current
      current = current.parent
    end

    result
  end

  def descendants
    children.flat_map do |child|
      [ child ] + child.descendants
    end
  end

  private
  def no_circular_dependency
    if parent_id && (parent_id == id || parent.ancestors.map(&:id).include?(id))
      errors.add(:parent_id, "The parent already exists in the hierarchy")
    end
  end

  def unique_name_for_user_and_parent
    scope_conditions = { user_id: user_id }
    scope_conditions[:parent_id] = parent_id if parent_id.present?

    if self.class.exists?(scope_conditions.merge(name: name))
      errors.add(:name, "has already been taken")
    end
  end
end
