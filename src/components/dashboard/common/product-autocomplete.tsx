import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

type ProductOption = {
  id: number;
  name: string;
};

type Props = {
  companyId: string;
  selectedProductId: number | null;
  setSelectedProductId: (id: number | null) => void;
};

const ProductAutocomplete: React.FC<Props> = ({ companyId, selectedProductId, setSelectedProductId }) => {
  const [productName, setProductName] = useState('');
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productName) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get<{ data: ProductOption[] }>(
          `/api/${companyId}/search-products?search=${productName}`
        );
        setProductOptions(response.data.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [productName, companyId]);

  return (
    <Autocomplete
      options={productOptions}
      getOptionLabel={(option) => option.name}
      value={productOptions.find((option) => option.id === selectedProductId) || null}
      onInputChange={(event, newInputValue) => setProductName(newInputValue)}
      onChange={(event, newValue) => setSelectedProductId(newValue?.id || null)}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Product"
          variant="outlined"
          fullWidth
          required
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default ProductAutocomplete;
