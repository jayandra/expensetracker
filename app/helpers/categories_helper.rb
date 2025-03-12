module CategoriesHelper
  def parent_selector(categories, parent_id = nil, level = 0)
    categories.select { |c| c.parent_id == parent_id }.map do |category|
      indent = "  —" * level
      [[ indent, category.name ].join(" "), category.id ] + parent_selector(categories, category.id, level + 1)
    end.flatten.each_slice(2).to_a
  end
end
