class Category < ApplicationRecord
  belongs_to :parent, class_name: "Category", foreign_key: :parent_id, optional: true
  has_many :children, class_name: "Category", foreign_key: :parent_id, dependent: :destroy

  validates :name, presence: true, uniqueness: { scope: :parent_id }
  validate :no_circular_dependency

  scope :roots, -> { where(parent_id: nil) }

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

  def no_circular_dependency
    if parent_id && (parent_id == id || parent.ancestors.map(&:id).include?(id))
      errors.add(:parent_id, "The parent already exists in the hierarchy")
    end
  end
end
