import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import CategoryListItem from '../CategoryListItem';

jest.mock('../../UI/IconButton/CustomIconButton', () => ({ icon, onClick }: any) => (
  <button type="button" aria-label={icon} onClick={onClick}>{icon}</button>
));

describe('CategoryListItem', () => {
  const category = {
    categoryId: 'cat-1',
    category: 'Hardware',
    subCategories: [
      { subCategoryId: 'sub-1', subCategory: 'Laptop', severityId: null },
    ],
  };

  it('renders category label, handles selection, and uses warning color for missing severities', () => {
    const onSelect = jest.fn();
    render(
      <CategoryListItem
        type="category"
        item={category}
        isSelected={false}
        onSelect={onSelect}
      />,
    );

    const label = screen.getByText('Hardware');
    const listItem = label.closest('li') as HTMLElement;

    expect(listItem).toHaveStyle({ background: '#ffe0b2' });
    fireEvent.click(listItem);
    expect(onSelect).toHaveBeenCalledWith(category);

    fireEvent.mouseEnter(listItem);
    expect(listItem).toHaveStyle({ background: '#ffcc80' });
  });

  it('shows edit/delete actions on hover and does not trigger select on icon clicks', () => {
    const onSelect = jest.fn();
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(
      <CategoryListItem
        type="category"
        item={{ ...category, subCategories: [{ subCategoryId: 'sub-ok', subCategory: 'Desktop', severityId: 'S1' }] }}
        isSelected
        onSelect={onSelect}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    const label = screen.getByText('Hardware');
    const listItem = label.closest('li') as HTMLElement;
    const editButton = listItem.querySelector('button[aria-label="Edit"]') as HTMLButtonElement;
    const deleteButton = listItem.querySelector('button[aria-label="Delete"]') as HTMLButtonElement;
    const actions = editButton.parentElement as HTMLElement;

    expect(listItem).toHaveStyle({ background: '#a5d6a7' });
    expect(actions).toHaveStyle({ visibility: 'hidden' });

    fireEvent.mouseEnter(listItem);
    expect(actions).toHaveStyle({ visibility: 'visible' });

    fireEvent.click(editButton);
    fireEvent.click(deleteButton);

    expect(onEdit).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.mouseLeave(listItem);
    expect(listItem).toHaveStyle({ background: '#a5d6a7' });
  });

  it('renders subcategory variant and applies severity-aware colors', () => {
    const onSelect = jest.fn();
    const subCategory = { subCategoryId: 'sub-2', subCategory: 'Network', severityId: 'S2' };

    render(
      <CategoryListItem
        type="subcategory"
        item={subCategory}
        isSelected={false}
        onSelect={onSelect}
      />,
    );

    const label = screen.getByText('Network');
    const listItem = label.closest('li') as HTMLElement;

    expect(listItem).toHaveStyle({ background: '#cae9dc' });
    fireEvent.mouseEnter(listItem);
    expect(listItem).toHaveStyle({ background: '#c5e1a5' });

    fireEvent.click(listItem);
    expect(onSelect).toHaveBeenCalledWith(subCategory);
  });
});
