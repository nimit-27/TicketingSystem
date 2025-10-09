import React, { useMemo, useState } from 'react';
import CustomIconButton from '../UI/IconButton/CustomIconButton';
import { Category, SubCategory } from '../../types';

type CategoryItemProps = {
    type: 'category';
    item: Category;
    isSelected: boolean;
    onSelect: (item: Category) => void;
    onEdit?: (item: Category) => void;
    onDelete?: (item: Category) => void;
};

type SubCategoryItemProps = {
    type: 'subcategory';
    item: SubCategory;
    isSelected: boolean;
    onSelect: (item: SubCategory) => void;
    onEdit?: (item: SubCategory) => void;
    onDelete?: (item: SubCategory) => void;
};

export type CategoryListItemProps = CategoryItemProps | SubCategoryItemProps;

const getCategoryBackground = (cat: Category, isHovered: boolean, isSelected: boolean) => {
    const hasMissingSeverity = Array.isArray(cat.subCategories) && cat.subCategories.some(sc => !sc.severityId);
    const baseGreen = '#dcedc8';
    const hoverGreen = '#c5e1a5';
    const selectedGreen = '#a5d6a7';
    const baseOrange = '#ffe0b2';
    const hoverOrange = '#ffcc80';
    const selectedOrange = '#ffb74d';

    if (hasMissingSeverity) {
        if (isSelected) return selectedOrange;
        return isHovered ? hoverOrange : baseOrange;
    }
    if (isSelected) return selectedGreen;
    return isHovered ? hoverGreen : baseGreen;
};

const getSubCategoryBackground = (sc: SubCategory, isHovered: boolean, isSelected: boolean) => {
    const hasSeverity = Boolean(sc.severityId);
    const baseGreen = '#dcedc8';
    const hoverGreen = '#c5e1a5';
    const selectedGreen = '#a5d6a7';
    const baseOrange = '#ffe0b2';
    const hoverOrange = '#ffcc80';
    const selectedOrange = '#ffb74d';

    if (hasSeverity) {
        if (isSelected) return selectedGreen;
        return isHovered ? hoverGreen : baseGreen;
    }
    if (isSelected) return selectedOrange;
    return isHovered ? hoverOrange : baseOrange;
};

const CategoryListItem: React.FC<CategoryListItemProps> = props => {
    const { isSelected } = props;
    const [isHovered, setIsHovered] = useState(false);

    const background = useMemo(() => {
        if (props.type === 'category') {
            return getCategoryBackground(props.item, isHovered, isSelected);
        }
        return getSubCategoryBackground(props.item, isHovered, isSelected);
    }, [props.type, props.item, isHovered, isSelected]);

    const label = props.type === 'category' ? props.item.category : props.item.subCategory;

    const handleSelect = () => {
        if (props.type === 'category') {
            props.onSelect(props.item);
        } else {
            props.onSelect(props.item);
        }
    };

    const handleEdit = (event: React.MouseEvent) => {
        event.stopPropagation();
        if (props.type === 'category') {
            props.onEdit?.(props.item);
        } else {
            props.onEdit?.(props.item);
        }
    };

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        if (props.type === 'category') {
            props.onDelete?.(props.item);
        } else {
            props.onDelete?.(props.item);
        }
    };

    return (
        <li
            className={`list-group-item d-flex align-items-center justify-content-between px-3 py-2 border border-secondary ${
                isSelected ? 'fw-semibold' : ''
            }`}
            style={{
                background,
                borderRadius: 0,
                cursor: 'pointer',
                borderColor: '#495057',
                transition: 'background-color 0.2s ease-in-out'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleSelect}
        >
            <span className="flex-grow-1">{label}</span>
            {(props.onEdit || props.onDelete) && (
                <div className="d-flex gap-2" style={{ visibility: isHovered ? 'visible' : 'hidden' }}>
                    {props.onEdit && <CustomIconButton icon="Edit" size="small" onClick={handleEdit} />}
                    {props.onDelete && <CustomIconButton icon="Delete" size="small" onClick={handleDelete} />}
                </div>
            )}
        </li>
    );
};

export default CategoryListItem;
