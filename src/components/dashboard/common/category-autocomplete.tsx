import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

type CategoryOption = {
  id: string;
  categoryName: string;
};

type Props = {
  companyId: string;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
};

const CategoryAutocomplete: React.FC<Props> = ({ companyId, selectedCategoryId, setSelectedCategoryId }) => {
  const [categoryName, setCategoryName] = useState('');
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch all categories when the companyId is available
    if (!companyId) return;

    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get<any>(`/api/${companyId}/category`);
        setCategoryOptions(response.data.data); // Assuming response.data.data contains the list of categories
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [companyId]);

  return (
    <Autocomplete
      options={categoryOptions}
      getOptionLabel={(option) => option.categoryName}
      value={categoryOptions.find((option) => option.id === selectedCategoryId) || null}
      onInputChange={(event, newInputValue) => setCategoryName(newInputValue)} // Update categoryName on input
      onChange={(event, newValue) => setSelectedCategoryId(newValue?.id || null)} // Set the selected category ID
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Category"
          variant="outlined"
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null} {/* Show loading spinner while fetching */}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default CategoryAutocomplete;
