document.addEventListener('DOMContentLoaded', function() {
  const productInfo = document.getElementsByClassName("product__info-container");
  const customerType = productInfo[0].getAttribute('data-customerType');
  const productHandle = productInfo[0].getAttribute('data-productHandle');
  
  // Your Shopify store URL and API access token
  const storeUrl = 'https://nexwebsolution.myshopify.com';
  const storefrontAccessToken = '0e40a1f69eedbfc6642d4962ae345203';

  // Function to fetch product variants
  async function fetchProductVariants(productHandle) {
    const query = `
    {
      productByHandle(handle: "${productHandle}") {
        title
        variants(first: 10) {
          edges {
            node {
              id
              title
              selectedOptions {
                name
                value
              }
              metafield(namespace: "custom", key: "customer_type") {
                value
              }
            }
          }
        }
      }
    }`;
    
    try {
      const response = await fetch(`${storeUrl}/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      const arrayVariants = data.data.productByHandle.variants.edges;

      let filteredVariants;
      if(customerType === "wholesale") {
        filteredVariants = arrayVariants.filter(variant => variant.node.metafield && variant.node.metafield.value === 'B2B');
      } else {
        filteredVariants = arrayVariants.filter(variant => variant.node.metafield && variant.node.metafield.value === 'B2C');
      }
 console.log("filteredVariants",filteredVariants)
      renderVariantOptions(filteredVariants);
    } catch (error) {
      console.error('Error fetching variants:', error);
    }
  }

  // Render variant options dynamically
  function renderVariantOptions(filteredVariants) {
    const colors = [...new Set(filteredVariants.map(variant => variant.node.selectedOptions.find(opt => opt.name === 'Color').value))];
    
    const colorContainer = document.getElementById('color-options');
    const sizeContainer = document.getElementById('size-options');
    colorContainer.innerHTML = '';
    sizeContainer.innerHTML = '';

    // Render color options as radio buttons
    colors.forEach((color, index) => {
      const colorRadio = document.createElement('input');
      colorRadio.type = 'radio';
      colorRadio.name = 'color';
      colorRadio.value = color;
      colorRadio.id = `color-${color}`;
      colorRadio.checked = index === 0; // Check the first color by default
      colorRadio.addEventListener('change', () => updateSizeOptions(color, filteredVariants));

      const colorLabel = document.createElement('label');
      colorLabel.setAttribute('for', `color-${color}`);
      colorLabel.textContent = color;

      colorContainer.appendChild(colorRadio);
      colorContainer.appendChild(colorLabel);
    });

    // Select the default color and update sizes based on it
    const defaultColor = colors[0];
    updateSizeOptions(defaultColor, filteredVariants);
  }

  function updateSizeOptions(selectedColor, filteredVariants) {
    const sizeContainer = document.getElementById('size-options');
    sizeContainer.innerHTML = '';

    // Filter variants based on selected color
    const sizes = filteredVariants
      .filter(variant => variant.node.selectedOptions.some(opt => opt.name === 'Color' && opt.value === selectedColor))
      .map(variant => variant.node.selectedOptions.find(opt => opt.name === 'Size').value);

    // Render size options as radio buttons
    sizes.forEach((size, index) => {
      const sizeRadio = document.createElement('input');
      sizeRadio.type = 'radio';
      sizeRadio.name = 'size';
      sizeRadio.value = size;
      sizeRadio.id = `size-${size}`;
      sizeRadio.checked = index === 0; // Check the first size by default
      sizeRadio.addEventListener('change', () => updateSelectedVariant(filteredVariants));

      const sizeLabel = document.createElement('label');
      sizeLabel.setAttribute('for', `size-${size}`);
      sizeLabel.textContent = size;

      sizeContainer.appendChild(sizeRadio);
      sizeContainer.appendChild(sizeLabel);
    });

    // Update the variant ID input based on the selected color and size
    updateSelectedVariant(filteredVariants);
  }

  function updateSelectedVariant(filteredVariants) {
    const colorSelected = document.querySelector('input[name="color"]:checked')?.value;
    const sizeSelected = document.querySelector('input[name="size"]:checked')?.value;
console.log("colorSelected",colorSelected)
    console.log("sizeSelected",sizeSelected)
    
    if (!colorSelected || !sizeSelected) {
      return;
    }

    // Click on the color swatch
const colorLabel = document.querySelector(`.product-form__input .swatch-input__label[title='${colorSelected}']`);
if (colorLabel) {
    colorLabel.click();
}

// Click on the size label
const sizeLabel = document.querySelector(`.product-form__input .label-variants[data-value='${sizeSelected}']`);
if (sizeLabel) {
    sizeLabel.click();
}
    
    const selectedVariant = filteredVariants.find(variant => {
      const colorMatch = variant.node.selectedOptions.some(opt => opt.name === 'Color' && opt.value === colorSelected);
      const sizeMatch = variant.node.selectedOptions.some(opt => opt.name === 'Size' && opt.value === sizeSelected);
      return colorMatch && sizeMatch;
    });
console.log("selectedVariant",selectedVariant)
    console.log("selectedVariant.node.id",selectedVariant.node.id)
    if (selectedVariant) {
    // Extract the numeric ID from the Global ID
    const globalId = selectedVariant.node.id;
    const numericId = globalId.split('/').pop();
console.log("numericId",numericId)
    // Update the variant ID in the form
    const variantIdInput = document.querySelector('input[name="id"]');
    if (variantIdInput) {
      variantIdInput.value = numericId; // Set only the numeric ID
    }
  }
  }



  fetchProductVariants(productHandle);
});
console.log("helllooo");
console.log("this is to check new branch")