import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from "@tanstack/react-db";
import { categoriesCollection, buildCategoryTree } from "../../db";
import Layout from "../Layout";
import WrapperTile from '../../components/WrapperTile';
import type { Category } from '../../types/models';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { CategoryItem } from './CategoryItem';

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

interface CategoryTreeProps {
  category: CategoryWithChildren;
  depth: number;
  expanded: { [key: number]: boolean };
  onToggle: (id: number) => void;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({ category, depth, expanded, onToggle }) => {
  return (
    <>
      <CategoryItem
        category={category}
        depth={depth}
        isExpanded={!!expanded[category.id]}
        onToggle={onToggle}
      />
      {category.children?.map(child => (
        <div key={child.id} className={depth > 0 ? 'mt-1' : 'mt-2'}>
          {expanded[category.id] && (
            <CategoryTree
              category={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
            />
          )}
        </div>
      ))}
    </>
  );
};

export default function CategoriesIndex() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<{[key: number]: boolean}>({});
  const [allExpanded, setAllExpanded] = useState<boolean>(false);

  const categories = useLiveQuery(
    (q) => q.from({ categories: categoriesCollection }).select(({categories}) => ({...categories})),
    []
  );
  const categoryTree = buildCategoryTree(categories.data || []) as CategoryWithChildren[];

  const toggleCategory = (id: number) => {
    setExpanded((prev: {[key: number]: boolean}) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleAll = () => {
    if (allExpanded) {
      setExpanded({});
    } else {
      const allExpandedState: {[key: number]: boolean} = {};
      const expandAll = (categories: CategoryWithChildren[]) => {
        categories.forEach(category => {
          allExpandedState[category.id] = true;
          if (category.children && category.children.length > 0) {
            expandAll(category.children);
          }
        });
      };
      expandAll(categoryTree);
      setExpanded(allExpandedState);
    }
    setAllExpanded(!allExpanded);
  };

  const addCategory = () => {
    navigate('/categories/new');
  };

  
  const header = (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h1 className="text-2xl font-bold text-neutral-900">Categories</h1>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <button
          onClick={toggleAll}
          className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {allExpanded ? (
            <>
              <span>Collapse All</span>
              <ExpandLessIcon className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Expand All</span>
              <ExpandMoreIcon className="w-4 h-4" />
            </>
          )}
        </button>
        <button
          onClick={addCategory}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
        >
          Add Category
        </button>
      </div>
    </div>
  );

  return (
    <Layout header={header}>
      <WrapperTile>
        {categoryTree.length > 0 ? (
          categoryTree.map(category => (
            <div key={category.id} className="mb-2 last:mb-0">
              <CategoryTree 
                category={category} 
                depth={0} 
                expanded={expanded} 
                onToggle={toggleCategory} 
              />
            </div>
          ))
        ) : (
          <div className="text-gray-600">No categories found. Create your first category to get started.</div>
        )}
      </WrapperTile>
    </Layout>
  );
}