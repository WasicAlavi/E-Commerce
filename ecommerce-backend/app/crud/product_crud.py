from typing import List, Optional
from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.product_tag import ProductTag
from app.models.tag import Tag
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut
from app.schemas.product_image import ProductImageCreate, ProductImageOut
from app.schemas.product_tag import ProductTagCreate

async def create_product(product_data: ProductCreate) -> Product:
    """Create a new product"""
    return await Product.create(
        name=product_data.name,
        description=product_data.description,
        price=product_data.price,
        stock=product_data.stock,
        brand=product_data.brand,
        material=product_data.material,
        colors=product_data.colors,
        sizes=product_data.sizes,
        care_instructions=product_data.care_instructions,
        features=product_data.features,
        specifications=product_data.specifications
    )

async def get_product_by_id(product_id: int) -> Optional[Product]:
    """Get product by ID"""
    return await Product.get_by_id(product_id)

async def get_products() -> List[Product]:
    """Get all products"""
    return await Product.get_all()

async def search_products(search_term: str) -> List[Product]:
    """Search products by name"""
    return await Product.search_by_name(search_term)

async def get_products_by_price_range(min_price: float, max_price: float) -> List[Product]:
    """Get products within price range"""
    return await Product.get_by_price_range(min_price, max_price)

async def get_products_in_stock() -> List[Product]:
    """Get products that are in stock"""
    return await Product.get_in_stock()

async def update_product(product_id: int, product_data: ProductUpdate) -> Optional[Product]:
    """Update product"""
    product = await Product.get_by_id(product_id)
    if not product:
        return None
    
    update_data = {}
    if product_data.name is not None:
        update_data['name'] = product_data.name
    if product_data.description is not None:
        update_data['description'] = product_data.description
    if product_data.price is not None:
        update_data['price'] = product_data.price
    if product_data.stock is not None:
        update_data['stock'] = product_data.stock
    if product_data.brand is not None:
        update_data['brand'] = product_data.brand
    if product_data.material is not None:
        update_data['material'] = product_data.material
    if product_data.colors is not None:
        update_data['colors'] = product_data.colors
    if product_data.sizes is not None:
        update_data['sizes'] = product_data.sizes
    if product_data.care_instructions is not None:
        update_data['care_instructions'] = product_data.care_instructions
    if product_data.features is not None:
        update_data['features'] = product_data.features
    if product_data.specifications is not None:
        update_data['specifications'] = product_data.specifications
    
    return await product.update(**update_data)

async def delete_product(product_id: int) -> bool:
    """Delete product"""
    product = await Product.get_by_id(product_id)
    if not product:
        return False
    return await product.delete()

async def update_product_stock(product_id: int, quantity: int) -> Optional[Product]:
    """Update product stock"""
    product = await Product.get_by_id(product_id)
    if not product:
        return None
    return await product.update_stock(quantity)

# Product Image CRUD operations
async def add_product_image(image_data: ProductImageCreate) -> ProductImage:
    """Add image to product"""
    return await ProductImage.create(
        product_id=image_data.product_id,
        image_url=image_data.image_url,
        is_primary=image_data.is_primary
    )

async def get_product_images(product_id: int) -> List[ProductImage]:
    """Get all images for a product"""
    return await ProductImage.get_by_product_id(product_id)

async def get_product_primary_image(product_id: int) -> Optional[ProductImage]:
    """Get primary image for a product"""
    return await ProductImage.get_primary_image(product_id)

async def set_product_image_as_primary(image_id: int) -> Optional[ProductImage]:
    """Set image as primary for product"""
    image = await ProductImage.get_by_id(image_id)
    if not image:
        return None
    return await image.set_as_primary()

async def delete_product_image(image_id: int) -> bool:
    """Delete product image"""
    image = await ProductImage.get_by_id(image_id)
    if not image:
        return False
    return await image.delete()

# Product Tag CRUD operations
async def add_tag_to_product(product_id: int, tag_name: str) -> Optional[ProductTag]:
    """Add tag to product"""
    # Get or create tag
    tag = await Tag.get_by_name(tag_name)
    if not tag:
        tag = await Tag.create(tag_name)
    
    # Check if association already exists
    existing_association = await ProductTag.get_by_product_id(product_id)
    for assoc in existing_association:
        if assoc.tag_id == tag.id:
            return assoc
    
    return await ProductTag.create(product_id, tag.id)

async def get_product_tags(product_id: int) -> List[dict]:
    """Get tag objects (id and name) for a product"""
    # Get all product_tag associations for this product
    product_tags = await ProductTag.get_by_product_id(product_id)
    tags = []
    for pt in product_tags:
        tag = await Tag.get_by_id(pt.tag_id)
        if tag:
            tags.append({"id": tag.id, "name": tag.tag_name})
    return tags

async def remove_tag_from_product(product_id: int, tag_name: str) -> bool:
    """Remove tag from product"""
    tag = await Tag.get_by_name(tag_name)
    if not tag:
        return False
    
    return await ProductTag.delete_by_product_and_tag(product_id, tag.id)

async def get_products_by_tag(tag_name: str) -> List[int]:
    """Get product IDs that have a specific tag"""
    return await ProductTag.get_products_by_tag_name(tag_name)

# Tag CRUD operations
async def create_tag(tag_name: str) -> Tag:
    """Create a new tag"""
    return await Tag.create(tag_name)

async def get_tags() -> List[Tag]:
    """Get all tags"""
    return await Tag.get_all()

async def get_tag_by_name(tag_name: str) -> Optional[Tag]:
    """Get tag by name"""
    return await Tag.get_by_name(tag_name)

async def get_products_by_tag_id(tag_id: int) -> List[Product]:
    """Get all products for a given tag (category)"""
    from app.models.product_tag import ProductTag
    product_tags = await ProductTag.get_by_tag_id(tag_id)
    product_ids = [pt.product_id for pt in product_tags]
    products = []
    for pid in product_ids:
        product = await Product.get_by_id(pid)
        if product:
            products.append(product)
    return products 