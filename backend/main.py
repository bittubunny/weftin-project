from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt

load_dotenv()  # Load environment variables from .env file

# ============================================================
# SECURITY CONFIGURATION
# ============================================================

SECRET_KEY = os.getenv("SECRET_KEY", "weftin_super_secret_atelier_jwt_key_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ============================================================
# APP
# ============================================================

app = FastAPI(title="WEFTIN Atelier NeonDB API")


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://(weftin-project.*\.vercel\.app|.*-bharaths-projects.*\.vercel\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DATABASE
# ============================================================

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set in the .env file")

def get_db_connection():
    return psycopg2.connect(
        DATABASE_URL,
        cursor_factory=RealDictCursor
    )


# ============================================================
# NOTIFICATION HELPER
# ============================================================

def create_notification(
    cur,
    user_email: str,
    notification_type: str,
    title: str,
    description: str,
    reference_type: Optional[str] = None,
    reference_id: Optional[str] = None
):
    """
    Create a notification using the current database cursor.

    The caller is responsible for conn.commit().
    """

    if not user_email:
        return None

    cur.execute(
        """
        INSERT INTO user_notifications (
            user_email,
            type,
            title,
            description,
            reference_type,
            reference_id
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING *
        """,
        (
            user_email,
            notification_type,
            title,
            description,
            reference_type,
            str(reference_id)
            if reference_id is not None
            else None
        )
    )

    return cur.fetchone()


# ============================================================
# PRODUCT MODELS
# ============================================================

class ProductCreate(BaseModel):
    name: str
    category: str
    price: str
    old_price: Optional[str] = None

    image: str
    image2: Optional[str] = None
    image3: Optional[str] = None
    image4: Optional[str] = None

    sku: str = "WFT-SR-1042"
    tag: str = "ATELIER EXCLUSIVE"

    description: Optional[str] = None
    material_care: Optional[str] = None

    sizes: list[str] = []
    color: Optional[str] = None

    in_stock: bool = True
    custom_stitching: bool = True


class ProductUpdate(BaseModel):
    name: str
    category: str
    price: str
    old_price: Optional[str] = None

    image: str
    image2: Optional[str] = None
    image3: Optional[str] = None
    image4: Optional[str] = None

    sku: str = "WFT-SR-1042"
    tag: str = "ATELIER EXCLUSIVE"

    description: Optional[str] = None
    material_care: Optional[str] = None

    sizes: list[str] = []
    color: Optional[str] = None

    in_stock: bool = True
    custom_stitching: bool = True


# ============================================================
# CART
# ============================================================

class CartItem(BaseModel):
    product_id: int
    size: str
    color: str
    quantity: int

    # Optional so existing frontend code does not immediately break.
    user_email: Optional[str] = None


# ============================================================
# NEWSLETTER
# ============================================================

class NewsletterSignup(BaseModel):
    email: str


# ============================================================
# GET PRODUCTS
# ============================================================

@app.get("/api/products")
def get_products(category: str = "All"):

    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        if category and category != "All":

            cur.execute(
                """
                SELECT *
                FROM products
                WHERE category ILIKE %s
                ORDER BY id DESC;
                """,
                (f"%{category}%",)
            )

        else:

            cur.execute(
                """
                SELECT *
                FROM products
                ORDER BY id DESC;
                """
            )

        products = cur.fetchall()

        return products

    except Exception as e:

        print("NeonDB Error:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch products: {str(e)}"
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# CREATE PRODUCT
# ============================================================

@app.post("/api/products")
def create_product(product: ProductCreate):

    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            INSERT INTO products (
                name,
                category,
                price,
                old_price,
                image,
                sku,
                tag,
                image2,
                image3,
                image4,
                description,
                material_care,
                sizes,
                color,
                in_stock,
                custom_stitching
            )
            VALUES (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
            RETURNING *;
            """,
            (
                product.name,
                product.category,
                product.price,
                product.old_price,
                product.image,
                product.sku,
                product.tag,
                product.image2,
                product.image3,
                product.image4,
                product.description,
                product.material_care,
                product.sizes,
                product.color,
                product.in_stock,
                product.custom_stitching
            )
        )

        new_product = cur.fetchone()

        conn.commit()

        return {
            "status": "success",
            "message": "Product saved to NeonDB successfully!",
            "data": new_product
        }

    except Exception as e:

        if conn:
            conn.rollback()

        print("DATABASE ERROR CREATING PRODUCT:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=f"Failed to create product: {str(e)}"
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# CART
# ============================================================

@app.post("/api/cart")
def add_to_cart(item: CartItem):

    conn = None
    cur = None

    try:

        # If frontend has not yet sent user_email,
        # keep the old cart behavior working.
        if not item.user_email:
            return {
                "status": "success",
                "message": f"Added product {item.product_id} to bag!"
            }

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT name
            FROM products
            WHERE id = %s;
            """,
            (item.product_id,)
        )

        product = cur.fetchone()

        product_name = (
            product["name"]
            if product
            else f"Product #{item.product_id}"
        )

        create_notification(
            cur,
            item.user_email,
            "cart",
            "Item added to bag",
            f"{product_name} was added to your shopping bag.",
            "product",
            item.product_id
        )

        conn.commit()

        return {
            "status": "success",
            "message": f"Added {product_name} to bag!"
        }

    except Exception as e:

        if conn:
            conn.rollback()

        print("CART ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=f"Failed to add item to cart: {str(e)}"
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# NEWSLETTER
# ============================================================

@app.post("/api/newsletter")
def subscribe_newsletter(data: NewsletterSignup):

    return {
        "status": "success",
        "message": f"Subscribed {data.email} successfully!"
    }


# ============================================================
# USER AUTH
# ============================================================

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ============================================================
# REGISTER
# ============================================================

@app.post("/api/register")
def register_user(user: UserRegister):

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT *
            FROM users
            WHERE email = %s;
            """,
            (user.email,)
        )

        existing = cur.fetchone()

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Email already registered."
            )

        hashed_password = get_password_hash(user.password)

        cur.execute(
            """
            INSERT INTO users (
                name,
                email,
                password
            )
            VALUES (%s, %s, %s)
            RETURNING id, name, email;
            """,
            (
                user.name,
                user.email,
                hashed_password
            )
        )

        new_user = cur.fetchone()

        create_notification(
            cur,
            user.email,
            "account",
            "Welcome to WEFTIN Atelier",
            "Your WEFTIN Atelier account was created successfully.",
            "user",
            new_user["id"]
        )

        conn.commit()

        token = create_access_token({"sub": new_user["email"]})

        return {
            "status": "success",
            "message": "Account created successfully!",
            "access_token": token,
            "token_type": "bearer",
            "user": new_user
        }

    except HTTPException:

        if conn:
            conn.rollback()

        raise

    except Exception as e:

        if conn:
            conn.rollback()

        print("REGISTER ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# LOGIN
# ============================================================

@app.post("/api/login")
def login_user(creds: UserLogin):

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT *
            FROM users
            WHERE email = %s;
            """,
            (creds.email,)
        )

        user = cur.fetchone()

        # Support both bcrypt hashes and legacy plaintext passwords safely
        is_valid = False
        if user:
            stored_pwd = user["password"]
            if stored_pwd.startswith("$2b$") or stored_pwd.startswith("$2a$"):
                is_valid = verify_password(creds.password, stored_pwd)
            else:
                is_valid = (creds.password == stored_pwd)

        if not user or not is_valid:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password."
            )

        create_notification(
            cur,
            user["email"],
            "login",
            "New login detected",
            "You signed in to your WEFTIN Atelier account.",
            "login",
            None
        )

        conn.commit()

        token = create_access_token({"sub": user["email"]})

        return {
            "status": "success",
            "message": "Login successful!",
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "avatar": user.get("avatar")
            }
        }

    except HTTPException:

        if conn:
            conn.rollback()

        raise

    except Exception as e:

        if conn:
            conn.rollback()

        print("LOGIN ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# GET USER PROFILE
# ============================================================

@app.get("/api/user/{email}")
def get_user_profile(email: str):

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT
                id,
                name,
                email,
                phone,
                avatar
            FROM users
            WHERE email = %s;
            """,
            (email,)
        )

        user = cur.fetchone()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        return user

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# UPDATE USER PROFILE
# ============================================================

class UserUpdate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    avatar: Optional[str] = None


@app.put("/api/user/update")
def update_user_profile(user: UserUpdate):

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            UPDATE users
            SET
                name = %s,
                phone = %s,
                avatar = %s
            WHERE email = %s
            RETURNING id, name, email, phone, avatar;
            """,
            (
                user.name,
                user.phone,
                user.avatar,
                user.email
            )
        )

        updated_user = cur.fetchone()

        if not updated_user:
            raise HTTPException(
                status_code=404,
                detail="User not found."
            )

        create_notification(
            cur,
            user.email,
            "profile",
            "Profile updated",
            "Your profile information was updated successfully.",
            "profile",
            updated_user["id"]
        )

        conn.commit()

        return {
            "status": "success",
            "message": "Profile updated successfully in NeonDB!",
            "user": updated_user
        }

    except HTTPException:

        if conn:
            conn.rollback()

        raise

    except Exception as e:

        if conn:
            conn.rollback()

        print("PROFILE UPDATE ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# HOME PAGE PRODUCT ASSIGNMENT CMS
# ============================================================

class ProductPlacementUpdate(BaseModel):
    section_placement: str


VALID_HOME_SECTIONS = {
    "Not on Home",
    "Featured",
    "Best Seller",
    "Trending"
}


# ============================================================
# GET ALL SHOP PRODUCTS FOR ADMIN HOME CMS
# ============================================================

@app.get("/api/admin/home-products")
def get_home_products():

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT
                p.id,
                p.name,
                p.price,
                p.image,
                p.category,
                p.tag,
                COALESCE(
                    h.section_placement,
                    'Not on Home'
                ) AS section_placement
            FROM products p
            LEFT JOIN home_product_sections h
                ON p.id = h.product_id
            ORDER BY p.id DESC;
            """
        )

        rows = cur.fetchall()

        products = []

        for r in rows:

            products.append({
                "id": r["id"],
                "name": r["name"],
                "price": (
                    f"₹{r['price']}"
                    if r["price"]
                    and not str(r["price"]).startswith("₹")
                    else r["price"]
                ),
                "image": r["image"],
                "category": r["category"],
                "tag": r["tag"],
                "section_placement": r["section_placement"]
            })

        return products

    except Exception as e:

        print(
            "Error fetching Home CMS products:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch Home products: {str(e)}"
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# UPDATE HOME PRODUCT PLACEMENT
# ============================================================

@app.put("/api/admin/home-products/{product_id}/placement")
def update_home_product_placement(
    product_id: int,
    payload: ProductPlacementUpdate
):

    conn = None
    cur = None

    try:

        if payload.section_placement not in VALID_HOME_SECTIONS:

            raise HTTPException(
                status_code=400,
                detail="Invalid Home section."
            )

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT id, name
            FROM products
            WHERE id = %s;
            """,
            (product_id,)
        )

        product = cur.fetchone()

        if not product:

            raise HTTPException(
                status_code=404,
                detail="Product not found in Shop catalog."
            )

        if payload.section_placement == "Not on Home":

            cur.execute(
                """
                DELETE FROM home_product_sections
                WHERE product_id = %s
                RETURNING product_id;
                """,
                (product_id,)
            )

        else:

            cur.execute(
                """
                INSERT INTO home_product_sections
                    (product_id, section_placement)
                VALUES
                    (%s, %s)
                ON CONFLICT (product_id)
                DO UPDATE SET
                    section_placement = EXCLUDED.section_placement
                RETURNING product_id, section_placement;
                """,
                (
                    product_id,
                    payload.section_placement
                )
            )

        conn.commit()

        return {
            "status": "success",
            "message": (
                f"{product['name']} assigned to "
                f"{payload.section_placement}."
            ),
            "product_id": product_id,
            "section_placement": payload.section_placement
        }

    except HTTPException:

        if conn:
            conn.rollback()

        raise

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "Error updating Home product placement:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Failed to update placement: {str(e)}"
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# UPDATE PRODUCT
# ============================================================

@app.put("/api/products/{product_id}")
def update_product(
    product_id: int,
    product: ProductUpdate
):

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            UPDATE products
            SET
                name = %s,
                category = %s,
                price = %s,
                old_price = %s,
                image = %s,
                image2 = %s,
                image3 = %s,
                image4 = %s,
                sku = %s,
                tag = %s,
                description = %s,
                material_care = %s,
                sizes = %s,
                color = %s,
                in_stock = %s,
                custom_stitching = %s
            WHERE id = %s
            RETURNING *;
            """,
            (
                product.name,
                product.category,
                product.price,
                product.old_price,
                product.image,
                product.image2,
                product.image3,
                product.image4,
                product.sku,
                product.tag,
                product.description,
                product.material_care,
                product.sizes,
                product.color,
                product.in_stock,
                product.custom_stitching,
                product_id
            )
        )

        updated_product = cur.fetchone()

        if not updated_product:

            conn.rollback()

            raise HTTPException(
                status_code=404,
                detail="Product not found."
            )

        conn.commit()

        return {
            "status": "success",
            "message": "Product updated successfully!",
            "data": updated_product
        }

    except HTTPException:
        raise

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "DATABASE ERROR UPDATING PRODUCT:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Failed to update product: {str(e)}"
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# GET PRODUCTS FOR HOME SECTION
# ============================================================

@app.get("/api/home-products")
def get_home_products_by_section(section: str = None):

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        if section:

            clean_section = section.replace("+", " ").strip()

            if clean_section not in {
                "Featured",
                "Best Seller",
                "Trending"
            }:

                raise HTTPException(
                    status_code=400,
                    detail="Invalid Home section."
                )

            cur.execute(
                """
                SELECT
                    p.*,
                    h.section_placement
                FROM products p
                INNER JOIN home_product_sections h
                    ON p.id = h.product_id
                WHERE h.section_placement = %s
                ORDER BY p.id DESC;
                """,
                (clean_section,)
            )

        else:

            cur.execute(
                """
                SELECT
                    p.*,
                    h.section_placement
                FROM products p
                INNER JOIN home_product_sections h
                    ON p.id = h.product_id
                WHERE h.section_placement IN (
                    'Featured',
                    'Best Seller',
                    'Trending'
                )
                ORDER BY p.id DESC;
                """
            )

        rows = cur.fetchall()

        products = []

        for r in rows:

            product = dict(r)

            if product.get("price") is not None:

                price = str(product["price"])

                if not price.startswith("₹"):
                    product["price"] = f"₹{price}"

            products.append(product)

        return products

    except HTTPException:
        raise

    except Exception as e:

        print(
            "Error fetching Home products:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch Home products: {str(e)}"
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# WISHLIST
# ============================================================

class WishlistItemCreate(BaseModel):
    user_email: str
    product_id: int
    name: str
    price: str
    image: str
    tag: str = "ATELIER SAVED"


# ============================================================
# ADD TO WISHLIST
# ============================================================

@app.post("/api/wishlist")
def add_to_wishlist(item: WishlistItemCreate):

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT id
            FROM user_wishlist
            WHERE user_email = %s
            AND product_id = %s;
            """,
            (
                item.user_email,
                item.product_id
            )
        )

        existing = cur.fetchone()

        if existing:

            return {
                "status": "success",
                "message": "Item is already in your wishlist!",
                "id": existing["id"]
            }

        cur.execute(
            """
            INSERT INTO user_wishlist
                (
                    user_email,
                    product_id,
                    name,
                    price,
                    image,
                    tag
                )
            VALUES
                (%s, %s, %s, %s, %s, %s)
            RETURNING id;
            """,
            (
                item.user_email,
                item.product_id,
                item.name,
                item.price,
                item.image,
                item.tag
            )
        )

        result = cur.fetchone()

        new_id = result["id"]

        create_notification(
            cur,
            item.user_email,
            "wishlist",
            "Added to wishlist",
            f"{item.name} was added to your wishlist.",
            "wishlist",
            new_id
        )

        conn.commit()

        return {
            "status": "success",
            "message": f"Saved {item.name} to your wishlist!",
            "id": new_id
        }

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "DATABASE ERROR IN WISHLIST:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Wishlist database error: {str(e)}"
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# GET USER WISHLIST
# ============================================================

@app.get("/api/wishlist/{email}")
def get_user_wishlist(email: str):

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT
                id,
                product_id,
                name,
                price,
                image,
                tag
            FROM user_wishlist
            WHERE user_email = %s
            ORDER BY id DESC;
            """,
            (email,)
        )

        rows = cur.fetchall()

        items = []

        for r in rows:

            items.append({
                "id": r["id"],
                "product_id": r["product_id"],
                "name": r["name"],
                "price": r["price"],
                "image": r["image"],
                "tag": r["tag"]
            })

        return items

    except Exception as e:

        print(
            "ERROR FETCHING WISHLIST:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch wishlist: {str(e)}"
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# REMOVE FROM WISHLIST
# ============================================================

@app.delete("/api/wishlist/{wishlist_id}")
def remove_from_wishlist(
    wishlist_id: int,
    user_email: str
):

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT *
            FROM user_wishlist
            WHERE id = %s
            AND user_email = %s;
            """,
            (
                wishlist_id,
                user_email
            )
        )

        existing = cur.fetchone()

        if not existing:

            raise HTTPException(
                status_code=404,
                detail="Wishlist item not found."
            )

        product_name = existing["name"]

        cur.execute(
            """
            DELETE FROM user_wishlist
            WHERE id = %s
            AND user_email = %s
            RETURNING id;
            """,
            (
                wishlist_id,
                user_email
            )
        )

        deleted = cur.fetchone()

        create_notification(
            cur,
            user_email,
            "wishlist",
            "Removed from wishlist",
            f"{product_name} was removed from your wishlist.",
            "wishlist",
            wishlist_id
        )

        conn.commit()

        return {
            "status": "success",
            "message": "Wishlist item removed successfully.",
            "id": deleted["id"]
        }

    except HTTPException:

        if conn:
            conn.rollback()

        raise

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "ERROR REMOVING WISHLIST ITEM:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Failed to remove wishlist item: {str(e)}"
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# ADDRESSES
# ============================================================

class AddressCreate(BaseModel):
    user_email: str
    title: str
    type: str = "HOME"
    address: str
    city: str
    phone: str
    is_default: bool = False


class AddressUpdate(BaseModel):
    title: str
    type: str = "HOME"
    address: str
    city: str
    phone: str
    is_default: bool = False


# ============================================================
# GET ADDRESSES
# ============================================================

@app.get("/api/addresses/{user_email}")
def get_user_addresses(user_email: str):

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT *
            FROM user_addresses
            WHERE user_email = %s
            ORDER BY is_default DESC, id DESC;
            """,
            (user_email,)
        )

        return cur.fetchall()

    except Exception as e:

        print("ADDRESS GET ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail="Failed to fetch addresses."
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# CREATE ADDRESS
# ============================================================

@app.post("/api/addresses")
def create_address(address: AddressCreate):

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        if address.is_default:

            cur.execute(
                """
                UPDATE user_addresses
                SET is_default = FALSE
                WHERE user_email = %s;
                """,
                (address.user_email,)
            )

        cur.execute(
            """
            SELECT COUNT(*) AS count
            FROM user_addresses
            WHERE user_email = %s;
            """,
            (address.user_email,)
        )

        count_result = cur.fetchone()

        address_count = count_result["count"]

        make_default = (
            address.is_default
            or address_count == 0
        )

        cur.execute(
            """
            INSERT INTO user_addresses
            (
                user_email,
                title,
                type,
                address,
                city,
                phone,
                is_default
            )
            VALUES
            (%s, %s, %s, %s, %s, %s, %s)
            RETURNING *;
            """,
            (
                address.user_email,
                address.title,
                address.type,
                address.address,
                address.city,
                address.phone,
                make_default
            )
        )

        new_address = cur.fetchone()

        create_notification(
            cur,
            address.user_email,
            "address",
            "Address added",
            (
                f"Your {address.type.lower()} "
                f"address was added successfully."
            ),
            "address",
            new_address["id"]
        )

        conn.commit()

        return new_address

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "ADDRESS CREATE ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to create address."
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# UPDATE ADDRESS
# ============================================================

@app.put("/api/addresses/{address_id}")
def update_address(
    address_id: int,
    address: AddressUpdate
):

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT *
            FROM user_addresses
            WHERE id = %s;
            """,
            (address_id,)
        )

        existing = cur.fetchone()

        if not existing:

            raise HTTPException(
                status_code=404,
                detail="Address not found."
            )

        user_email = existing["user_email"]

        if address.is_default:

            cur.execute(
                """
                UPDATE user_addresses
                SET is_default = FALSE
                WHERE user_email = %s
                AND id != %s;
                """,
                (
                    user_email,
                    address_id
                )
            )

        cur.execute(
            """
            UPDATE user_addresses
            SET
                title = %s,
                type = %s,
                address = %s,
                city = %s,
                phone = %s,
                is_default = %s
            WHERE id = %s
            RETURNING *;
            """,
            (
                address.title,
                address.type,
                address.address,
                address.city,
                address.phone,
                address.is_default,
                address_id
            )
        )

        updated_address = cur.fetchone()

        create_notification(
            cur,
            user_email,
            "address",
            "Address updated",
            (
                f"Your {address.type.lower()} "
                f"address was updated successfully."
            ),
            "address",
            address_id
        )

        conn.commit()

        return updated_address

    except HTTPException:

        if conn:
            conn.rollback()

        raise

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "ADDRESS UPDATE ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to update address."
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# DELETE ADDRESS
# ============================================================

@app.delete("/api/addresses/{address_id}")
def delete_address(address_id: int):

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT *
            FROM user_addresses
            WHERE id = %s;
            """,
            (address_id,)
        )

        existing = cur.fetchone()

        if not existing:

            raise HTTPException(
                status_code=404,
                detail="Address not found."
            )

        was_default = existing["is_default"]
        user_email = existing["user_email"]

        cur.execute(
            """
            DELETE FROM user_addresses
            WHERE id = %s
            RETURNING id;
            """,
            (address_id,)
        )

        deleted = cur.fetchone()

        if was_default:

            cur.execute(
                """
                SELECT id
                FROM user_addresses
                WHERE user_email = %s
                ORDER BY id DESC
                LIMIT 1;
                """,
                (user_email,)
            )

            next_address = cur.fetchone()

            if next_address:

                cur.execute(
                    """
                    UPDATE user_addresses
                    SET is_default = TRUE
                    WHERE id = %s;
                    """,
                    (next_address["id"],)
                )

        create_notification(
            cur,
            user_email,
            "address",
            "Address removed",
            "A delivery address was removed from your account.",
            "address",
            address_id
        )

        conn.commit()

        return {
            "status": "success",
            "message": "Address deleted successfully."
        }

    except HTTPException:

        if conn:
            conn.rollback()

        raise

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "ADDRESS DELETE ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to delete address."
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# MAKE ADDRESS DEFAULT
# ============================================================

@app.patch("/api/addresses/{address_id}/default")
def make_address_default(address_id: int):

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT *
            FROM user_addresses
            WHERE id = %s;
            """,
            (address_id,)
        )

        address = cur.fetchone()

        if not address:

            raise HTTPException(
                status_code=404,
                detail="Address not found."
            )

        user_email = address["user_email"]

        cur.execute(
            """
            UPDATE user_addresses
            SET is_default = FALSE
            WHERE user_email = %s;
            """,
            (user_email,)
        )

        cur.execute(
            """
            UPDATE user_addresses
            SET is_default = TRUE
            WHERE id = %s
            RETURNING *;
            """,
            (address_id,)
        )

        updated_address = cur.fetchone()

        create_notification(
            cur,
            user_email,
            "address",
            "Default address changed",
            "Your default delivery address was changed.",
            "address",
            address_id
        )

        conn.commit()

        return updated_address

    except HTTPException:

        if conn:
            conn.rollback()

        raise

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "ADDRESS DEFAULT ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to change default address."
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# MEASUREMENTS
# ============================================================

class MeasurementCreate(BaseModel):

    user_email: str

    name: str
    gender: str = "Female"
    usage: str = "Default Fit Profile"

    height: Optional[str] = None
    preferred_fit: Optional[str] = None

    bust: Optional[str] = None
    waist: Optional[str] = None
    shoulder: Optional[str] = None
    armhole: Optional[str] = None

    hips: Optional[str] = None
    sleeve: Optional[str] = None
    total_length: Optional[str] = None
    inseam: Optional[str] = None

    neck_cut: Optional[str] = None
    sleeve_sewing: Optional[str] = None
    hemline_length: Optional[str] = None

    remarks: Optional[str] = None

    status: str = "Complete"
    is_default: bool = False


class MeasurementUpdate(BaseModel):

    name: str
    gender: str = "Female"
    usage: str = "Default Fit Profile"

    height: Optional[str] = None
    preferred_fit: Optional[str] = None

    bust: Optional[str] = None
    waist: Optional[str] = None
    shoulder: Optional[str] = None
    armhole: Optional[str] = None

    hips: Optional[str] = None
    sleeve: Optional[str] = None
    total_length: Optional[str] = None
    inseam: Optional[str] = None

    neck_cut: Optional[str] = None
    sleeve_sewing: Optional[str] = None
    hemline_length: Optional[str] = None

    remarks: Optional[str] = None

    status: str = "Complete"
    is_default: bool = False


# ============================================================
# GET MEASUREMENTS
# ============================================================

@app.get("/api/measurements/{user_email}")
def get_user_measurements(user_email: str):

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT *
            FROM user_measurements
            WHERE user_email = %s
            ORDER BY is_default DESC, id DESC;
            """,
            (user_email,)
        )

        return cur.fetchall()

    except Exception as e:

        print(
            "MEASUREMENTS GET ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to fetch measurement profiles."
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# CREATE MEASUREMENT
# ============================================================

@app.post("/api/measurements")
def create_measurement(
    measurement: MeasurementCreate
):

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT COUNT(*) AS count
            FROM user_measurements
            WHERE user_email = %s;
            """,
            (measurement.user_email,)
        )

        result = cur.fetchone()

        profile_count = result["count"]

        make_default = (
            measurement.is_default
            or profile_count == 0
        )

        if make_default:

            cur.execute(
                """
                UPDATE user_measurements
                SET is_default = FALSE
                WHERE user_email = %s;
                """,
                (measurement.user_email,)
            )

        cur.execute(
            """
            INSERT INTO user_measurements (
                user_email,
                name,
                gender,
                usage,
                height,
                preferred_fit,
                bust,
                waist,
                shoulder,
                armhole,
                hips,
                sleeve,
                total_length,
                inseam,
                neck_cut,
                sleeve_sewing,
                hemline_length,
                remarks,
                status,
                is_default,
                updated_at
            )
            VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                CURRENT_TIMESTAMP
            )
            RETURNING *;
            """,
            (
                measurement.user_email,
                measurement.name,
                measurement.gender,
                measurement.usage,
                measurement.height,
                measurement.preferred_fit,
                measurement.bust,
                measurement.waist,
                measurement.shoulder,
                measurement.armhole,
                measurement.hips,
                measurement.sleeve,
                measurement.total_length,
                measurement.inseam,
                measurement.neck_cut,
                measurement.sleeve_sewing,
                measurement.hemline_length,
                measurement.remarks,
                measurement.status,
                make_default
            )
        )

        new_measurement = cur.fetchone()

        create_notification(
            cur,
            measurement.user_email,
            "measurement",
            "Measurement profile saved",
            (
                f"Your measurement profile "
                f"'{measurement.name}' was saved successfully."
            ),
            "measurement",
            new_measurement["id"]
        )

        conn.commit()

        return new_measurement

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "MEASUREMENTS CREATE ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to create measurement profile."
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# UPDATE MEASUREMENT
# ============================================================

@app.put("/api/measurements/{measurement_id}")
def update_measurement(
    measurement_id: int,
    measurement: MeasurementUpdate
):

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT *
            FROM user_measurements
            WHERE id = %s;
            """,
            (measurement_id,)
        )

        existing = cur.fetchone()

        if not existing:

            raise HTTPException(
                status_code=404,
                detail="Measurement profile not found."
            )

        user_email = existing["user_email"]

        if measurement.is_default:

            cur.execute(
                """
                UPDATE user_measurements
                SET is_default = FALSE
                WHERE user_email = %s
                AND id != %s;
                """,
                (
                    user_email,
                    measurement_id
                )
            )

        cur.execute(
            """
            UPDATE user_measurements
            SET
                name = %s,
                gender = %s,
                usage = %s,
                height = %s,
                preferred_fit = %s,
                bust = %s,
                waist = %s,
                shoulder = %s,
                armhole = %s,
                hips = %s,
                sleeve = %s,
                total_length = %s,
                inseam = %s,
                neck_cut = %s,
                sleeve_sewing = %s,
                hemline_length = %s,
                remarks = %s,
                status = %s,
                is_default = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING *;
            """,
            (
                measurement.name,
                measurement.gender,
                measurement.usage,
                measurement.height,
                measurement.preferred_fit,
                measurement.bust,
                measurement.waist,
                measurement.shoulder,
                measurement.armhole,
                measurement.hips,
                measurement.sleeve,
                measurement.total_length,
                measurement.inseam,
                measurement.neck_cut,
                measurement.sleeve_sewing,
                measurement.hemline_length,
                measurement.remarks,
                measurement.status,
                measurement.is_default,
                measurement_id
            )
        )

        updated_measurement = cur.fetchone()

        create_notification(
            cur,
            user_email,
            "measurement",
            "Measurements updated",
            (
                f"Your measurement profile "
                f"'{measurement.name}' was updated successfully."
            ),
            "measurement",
            measurement_id
        )

        conn.commit()

        return updated_measurement

    except HTTPException:

        if conn:
            conn.rollback()

        raise

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "MEASUREMENTS UPDATE ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to update measurement profile."
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# DELETE MEASUREMENT
# ============================================================

@app.delete("/api/measurements/{measurement_id}")
def delete_measurement(
    measurement_id: int
):

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT *
            FROM user_measurements
            WHERE id = %s;
            """,
            (measurement_id,)
        )

        existing = cur.fetchone()

        if not existing:

            raise HTTPException(
                status_code=404,
                detail="Measurement profile not found."
            )

        user_email = existing["user_email"]
        was_default = existing["is_default"]
        profile_name = existing["name"]

        cur.execute(
            """
            DELETE FROM user_measurements
            WHERE id = %s
            RETURNING id;
            """,
            (measurement_id,)
        )

        deleted = cur.fetchone()

        if was_default:

            cur.execute(
                """
                SELECT id
                FROM user_measurements
                WHERE user_email = %s
                ORDER BY id DESC
                LIMIT 1;
                """,
                (user_email,)
            )

            next_profile = cur.fetchone()

            if next_profile:

                cur.execute(
                    """
                    UPDATE user_measurements
                    SET is_default = TRUE
                    WHERE id = %s;
                    """,
                    (next_profile["id"],)
                )

        create_notification(
            cur,
            user_email,
            "measurement",
            "Measurement profile removed",
            (
                f"Your measurement profile "
                f"'{profile_name}' was removed."
            ),
            "measurement",
            measurement_id
        )

        conn.commit()

        return {
            "status": "success",
            "message": "Measurement profile deleted successfully."
        }

    except HTTPException:

        if conn:
            conn.rollback()

        raise

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "MEASUREMENTS DELETE ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to delete measurement profile."
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# SET MEASUREMENT DEFAULT
# ============================================================

@app.patch("/api/measurements/{measurement_id}/default")
def set_measurement_default(
    measurement_id: int
):

    conn = None
    cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT *
            FROM user_measurements
            WHERE id = %s;
            """,
            (measurement_id,)
        )

        existing = cur.fetchone()

        if not existing:

            raise HTTPException(
                status_code=404,
                detail="Measurement profile not found."
            )

        user_email = existing["user_email"]

        cur.execute(
            """
            UPDATE user_measurements
            SET is_default = FALSE
            WHERE user_email = %s;
            """,
            (user_email,)
        )

        cur.execute(
            """
            UPDATE user_measurements
            SET
                is_default = TRUE,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING *;
            """,
            (measurement_id,)
        )

        updated = cur.fetchone()

        create_notification(
            cur,
            user_email,
            "measurement",
            "Default measurements changed",
            (
                f"'{existing['name']}' is now your "
                f"default measurement profile."
            ),
            "measurement",
            measurement_id
        )

        conn.commit()

        return updated

    except HTTPException:

        if conn:
            conn.rollback()

        raise

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "MEASUREMENTS DEFAULT ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to change default measurement profile."
        )

    finally:

        if cur:
            cur.close()

        if conn:
            conn.close()


# ============================================================
# CUSTOM DESIGNS
# ============================================================

class CustomDesignCreate(BaseModel):

    user_email: str

    product_id: Optional[int] = None
    product_name: str
    product_category: Optional[str] = None
    product_price: Optional[str] = None
    product_image: Optional[str] = None

    status: str = "Drafting Blueprint"

    line: str = "BESPOKE CUSTOM LINE"

    message: str = (
        "Master tailor received your bespoke request for this "
        "piece. We are currently compiling fabric availability "
        "and embroidery layout drafts."
    )


# ============================================================
# CREATE CUSTOM DESIGN
# ============================================================

@app.post("/api/custom-designs")
def create_custom_design(
    request: CustomDesignCreate
):

    conn = None

    try:

        conn = get_db_connection()

        with conn.cursor(
            cursor_factory=RealDictCursor
        ) as cur:

            cur.execute(
                """
                INSERT INTO custom_design_requests (
                    user_email,
                    product_id,
                    product_name,
                    product_category,
                    product_price,
                    product_image,
                    status,
                    line,
                    message
                )
                VALUES (
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s
                )
                RETURNING *;
                """,
                (
                    request.user_email,
                    request.product_id,
                    request.product_name,
                    request.product_category,
                    request.product_price,
                    request.product_image,
                    request.status,
                    request.line,
                    request.message
                )
            )

            result = cur.fetchone()

            create_notification(
                cur,
                request.user_email,
                "custom_design",
                "Custom design request created",
                (
                    f"Your bespoke request for "
                    f"{request.product_name} has been submitted."
                ),
                "custom_design",
                result["id"]
            )

            conn.commit()

            return result

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "CUSTOM DESIGN CREATE ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if conn:
            conn.close()


# ============================================================
# GET CUSTOM DESIGNS
# ============================================================

@app.get("/api/custom-designs/{user_email}")
def get_custom_designs(
    user_email: str
):

    conn = None

    try:

        conn = get_db_connection()

        with conn.cursor(
            cursor_factory=RealDictCursor
        ) as cur:

            cur.execute(
                """
                SELECT *
                FROM custom_design_requests
                WHERE user_email = %s
                ORDER BY created_at DESC;
                """,
                (user_email,)
            )

            return cur.fetchall()

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if conn:
            conn.close()


# ============================================================
# DELETE CUSTOM DESIGN
# ============================================================

@app.delete("/api/custom-designs/{request_id}")
def delete_custom_design(
    request_id: int,
    user_email: str
):

    conn = None

    try:

        conn = get_db_connection()

        with conn.cursor(
            cursor_factory=RealDictCursor
        ) as cur:

            cur.execute(
                """
                SELECT *
                FROM custom_design_requests
                WHERE id = %s
                AND user_email = %s;
                """,
                (
                    request_id,
                    user_email
                )
            )

            existing = cur.fetchone()

            if not existing:

                raise HTTPException(
                    status_code=404,
                    detail="Custom design request not found"
                )

            cur.execute(
                """
                DELETE FROM custom_design_requests
                WHERE id = %s
                AND user_email = %s
                RETURNING id;
                """,
                (
                    request_id,
                    user_email
                )
            )

            deleted = cur.fetchone()

            create_notification(
                cur,
                user_email,
                "custom_design",
                "Custom design request removed",
                (
                    f"Your custom design request for "
                    f"{existing['product_name']} was removed."
                ),
                "custom_design",
                request_id
            )

            conn.commit()

            return {
                "message": (
                    "Custom design request "
                    "deleted successfully"
                )
            }

    except HTTPException:

        if conn:
            conn.rollback()

        raise

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "CUSTOM DESIGN DELETE ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if conn:
            conn.close()


# ============================================================
# NOTIFICATIONS
# ============================================================

@app.get("/api/notifications/{user_email}")
def get_notifications(
    user_email: str
):

    conn = None

    try:

        conn = get_db_connection()

        with conn.cursor(
            cursor_factory=RealDictCursor
        ) as cur:

            cur.execute(
                """
                SELECT *
                FROM user_notifications
                WHERE user_email = %s
                ORDER BY created_at DESC;
                """,
                (user_email,)
            )

            return cur.fetchall()

    except Exception as e:

        print(
            "GET NOTIFICATIONS ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if conn:
            conn.close()


@app.get("/api/notifications/unread-count/{user_email}")
def get_unread_notification_count(
    user_email: str
):

    conn = None

    try:

        conn = get_db_connection()

        with conn.cursor() as cur:

            cur.execute(
                """
                SELECT COUNT(*) AS count
                FROM user_notifications
                WHERE user_email = %s
                AND is_read = FALSE;
                """,
                (user_email,)
            )

            result = cur.fetchone()

            count = result["count"] if result else 0

            return {
                "count": count
            }

    except Exception as e:

        print(
            "UNREAD NOTIFICATION COUNT ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if conn:
            conn.close()


@app.put("/api/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    user_email: str
):

    conn = None

    try:

        conn = get_db_connection()

        with conn.cursor(
            cursor_factory=RealDictCursor
        ) as cur:

            cur.execute(
                """
                UPDATE user_notifications
                SET is_read = TRUE
                WHERE id = %s
                AND user_email = %s
                RETURNING *;
                """,
                (
                    notification_id,
                    user_email
                )
            )

            notification = cur.fetchone()

            if not notification:

                raise HTTPException(
                    status_code=404,
                    detail="Notification not found"
                )

            conn.commit()

            return notification

    except HTTPException:

        if conn:
            conn.rollback()

        raise

    except Exception as e:

        if conn:
            conn.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if conn:
            conn.close()


@app.put("/api/notifications/read-all/{user_email}")
def mark_all_notifications_read(
    user_email: str
):

    conn = None

    try:

        conn = get_db_connection()

        with conn.cursor() as cur:

            cur.execute(
                """
                UPDATE user_notifications
                SET is_read = TRUE
                WHERE user_email = %s
                AND is_read = FALSE;
                """,
                (user_email,)
            )

            updated_count = cur.rowcount

            conn.commit()

            return {
                "message": "All notifications marked as read",
                "updated": updated_count
            }

    except Exception as e:

        if conn:
            conn.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if conn:
            conn.close()


@app.delete("/api/notifications/{user_email}")
def clear_all_notifications(
    user_email: str
):

    conn = None

    try:

        conn = get_db_connection()

        with conn.cursor() as cur:

            cur.execute(
                """
                DELETE FROM user_notifications
                WHERE user_email = %s;
                """,
                (user_email,)
            )

            deleted_count = cur.rowcount

            conn.commit()

            return {
                "message": "Notifications cleared",
                "deleted": deleted_count
            }

    except Exception as e:

        if conn:
            conn.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if conn:
            conn.close()


# ============================================================
# ROOT / HEALTH CHECK
# ============================================================

@app.get("/")
def root():

    return {
        "status": "online",
        "message": "WEFTIN Atelier API is running."
    }


class OrderCreate(BaseModel):
    user_email: str

    product_id: Optional[int] = None
    product_name: str
    product_category: Optional[str] = None
    product_image: Optional[str] = None

    quantity: int = 1

    size: Optional[str] = None
    color: Optional[str] = None

    unit_price: float = 0
    total_price: float = 0

    status: str = "PROCESSING"
    payment_status: str = "PENDING"

    shipping_address: Optional[str] = None

    tracking_number: Optional[str] = None
    courier: Optional[str] = None

    estimated_delivery: Optional[str] = None


# ============================================================
# ORDERS
# ============================================================

@app.get("/api/orders/{user_email}")
def get_user_orders(user_email: str):
    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT *
            FROM orders
            WHERE user_email = %s
            ORDER BY ordered_at DESC, id DESC
            """,
            (user_email,)
        )

        orders = cur.fetchall()

        return orders

    except Exception as e:
        print("GET ORDERS ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch orders"
        )

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.get("/api/orders/{user_email}/{order_number}")
def get_single_order(user_email: str, order_number: str):
    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT *
            FROM orders
            WHERE order_number = %s
              AND user_email = %s
            LIMIT 1
            """,
            (order_number, user_email)
        )

        order = cur.fetchone()

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )

        return order

    except HTTPException:
        raise

    except Exception as e:
        print("GET SINGLE ORDER ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch order"
        )

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.post("/api/orders")
def create_order(order: OrderCreate):
    conn = None
    cur = None

    try:
        if order.quantity < 1:
            raise HTTPException(
                status_code=400,
                detail="Quantity must be at least 1"
            )

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            INSERT INTO orders (
                order_number,
                user_email,
                product_id,
                product_name,
                product_category,
                product_image,
                quantity,
                size,
                color,
                unit_price,
                total_price,
                status,
                payment_status,
                shipping_address,
                tracking_number,
                courier,
                estimated_delivery
            )
            VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s
            )
            RETURNING id
            """,
            (
                "TEMP",
                order.user_email,
                order.product_id,
                order.product_name,
                order.product_category,
                order.product_image,
                order.quantity,
                order.size,
                order.color,
                order.unit_price,
                order.total_price,
                order.status,
                order.payment_status,
                order.shipping_address,
                order.tracking_number,
                order.courier,
                order.estimated_delivery
            )
        )

        result = cur.fetchone()
        order_id = result["id"]

        order_number = f"WF-{datetime.now().year}-{order_id:06d}"

        cur.execute(
            """
            UPDATE orders
            SET order_number = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING *
            """,
            (order_number, order_id)
        )

        created_order = cur.fetchone()

        create_notification(
            cur,
            order.user_email,
            "ORDER",
            "Order Confirmed",
            f"Your order {order_number} has been placed successfully.",
            "ORDER",
            order_number
        )

        conn.commit()

        return created_order

    except HTTPException:
        if conn:
            conn.rollback()
        raise

    except Exception as e:
        if conn:
            conn.rollback()

        print("CREATE ORDER ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail="Failed to create order"
        )

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.put("/api/orders/{order_number}/status")
def update_order_status(
    order_number: str,
    status: str,
    user_email: str
):
    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT *
            FROM orders
            WHERE order_number = %s
              AND user_email = %s
            LIMIT 1
            """,
            (order_number, user_email)
        )

        existing_order = cur.fetchone()

        if not existing_order:
            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )

        cur.execute(
            """
            UPDATE orders
            SET status = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE order_number = %s
              AND user_email = %s
            RETURNING *
            """,
            (
                status,
                order_number,
                user_email
            )
        )

        updated_order = cur.fetchone()

        notification_type = "ORDER"
        title = "Order Status Updated"
        description = (
            f"Your order {order_number} status is now "
            f"{status.replace('_', ' ').title()}."
        )

        if status == "CONFIRMED":
            title = "Order Confirmed"
            description = f"Your order {order_number} has been confirmed."

        elif status == "TAILORING":
            title = "Tailoring Started"
            description = (
                f"Tailoring has started for your order {order_number}."
            )

        elif status == "READY_TO_SHIP":
            title = "Order Ready to Ship"
            description = (
                f"Your order {order_number} is ready to be shipped."
            )

        elif status == "SHIPPED":
            notification_type = "SHIPPING"
            title = "Order Shipped"
            description = (
                f"Your order {order_number} has been shipped."
            )

        elif status == "OUT_FOR_DELIVERY":
            notification_type = "SHIPPING"
            title = "Out for Delivery"
            description = (
                f"Your order {order_number} is out for delivery."
            )

        elif status == "DELIVERED":
            title = "Order Delivered"
            description = (
                f"Your order {order_number} has been delivered."
            )

        elif status == "CANCELLED":
            title = "Order Cancelled"
            description = (
                f"Your order {order_number} has been cancelled."
            )

        create_notification(
            cur,
            user_email,
            notification_type,
            title,
            description,
            "ORDER",
            order_number
        )

        conn.commit()

        return updated_order

    except HTTPException:
        if conn:
            conn.rollback()
        raise

    except Exception as e:
        if conn:
            conn.rollback()

        print("UPDATE ORDER STATUS ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail="Failed to update order status"
        )

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.delete("/api/orders/{order_number}")
def delete_order(
    order_number: str,
    user_email: str
):
    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute(
            """
            SELECT *
            FROM orders
            WHERE order_number = %s
              AND user_email = %s
            LIMIT 1
            """,
            (order_number, user_email)
        )

        order = cur.fetchone()

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )

        cur.execute(
            """
            DELETE FROM orders
            WHERE order_number = %s
              AND user_email = %s
            """,
            (order_number, user_email)
        )

        create_notification(
            cur,
            user_email,
            "ORDER",
            "Order Removed",
            f"Order {order_number} has been removed from your order history.",
            "ORDER",
            order_number
        )

        conn.commit()

        return {
            "status": "success",
            "message": "Order deleted successfully"
        }

    except HTTPException:
        if conn:
            conn.rollback()
        raise

    except Exception as e:
        if conn:
            conn.rollback()

        print("DELETE ORDER ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail="Failed to delete order"
        )

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# =========================================================
# LOOKBOOK API
# =========================================================

@app.get("/api/lookbook")
def get_lookbook():
    conn = None

    try:
        conn = get_db_connection()

        with conn.cursor() as cur:

            cur.execute("""
                SELECT *
                FROM lookbook_sections
                WHERE is_active = TRUE
                ORDER BY display_order ASC, id ASC
            """)

            sections = cur.fetchall()

            cur.execute("""
                SELECT *
                FROM lookbook_items
                WHERE is_active = TRUE
                ORDER BY display_order ASC, id ASC
            """)

            items = cur.fetchall()

        result = []

        for section in sections:

            section_data = dict(section)

            section_items = [
                dict(item)
                for item in items
                if item["section_key"] == section["section_key"]
            ]

            section_data["items"] = section_items

            result.append(section_data)

        return {
            "success": True,
            "sections": result
        }

    except Exception as e:

        print("LOOKBOOK GET ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if conn:
            conn.close()


@app.put("/api/lookbook/section/{section_key}")
def update_lookbook_section(section_key: str, data: dict):

    conn = None

    try:

        conn = get_db_connection()

        with conn.cursor() as cur:

            cur.execute(
                """
                UPDATE lookbook_sections
                SET
                    eyebrow = %s,
                    title = %s,
                    description = %s,
                    image_url = %s,
                    button_text = %s,
                    button_link = %s,
                    is_active = %s,
                    display_order = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE section_key = %s
                RETURNING *
                """,
                (
                    data.get("eyebrow"),
                    data.get("title"),
                    data.get("description"),
                    data.get("image_url"),
                    data.get("button_text"),
                    data.get("button_link"),
                    data.get("is_active", True),
                    data.get("display_order", 0),
                    section_key
                )
            )

            updated = cur.fetchone()

            if not updated:
                raise HTTPException(
                    status_code=404,
                    detail="Lookbook section not found"
                )

        conn.commit()

        return {
            "success": True,
            "section": updated
        }

    except HTTPException:
        raise

    except Exception as e:

        if conn:
            conn.rollback()

        print("LOOKBOOK SECTION UPDATE ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if conn:
            conn.close()


@app.post("/api/lookbook/item")
def create_lookbook_item(data: dict):

    conn = None

    try:

        conn = get_db_connection()

        with conn.cursor() as cur:

            cur.execute(
                """
                INSERT INTO lookbook_items
                (
                    section_key,
                    title,
                    description,
                    price,
                    image_url,
                    button_text,
                    button_link,
                    is_active,
                    display_order
                )
                VALUES
                (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
                """,
                (
                    data.get("section_key"),
                    data.get("title"),
                    data.get("description"),
                    data.get("price"),
                    data.get("image_url"),
                    data.get("button_text"),
                    data.get("button_link"),
                    data.get("is_active", True),
                    data.get("display_order", 0)
                )
            )

            item = cur.fetchone()

        conn.commit()

        return {
            "success": True,
            "item": item
        }

    except Exception as e:

        if conn:
            conn.rollback()

        print("LOOKBOOK ITEM CREATE ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if conn:
            conn.close()


@app.put("/api/lookbook/item/{item_id}")
def update_lookbook_item(item_id: int, data: dict):

    conn = None

    try:

        conn = get_db_connection()

        with conn.cursor() as cur:

            cur.execute(
                """
                UPDATE lookbook_items
                SET
                    section_key = %s,
                    title = %s,
                    description = %s,
                    price = %s,
                    image_url = %s,
                    button_text = %s,
                    button_link = %s,
                    is_active = %s,
                    display_order = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING *
                """,
                (
                    data.get("section_key"),
                    data.get("title"),
                    data.get("description"),
                    data.get("price"),
                    data.get("image_url"),
                    data.get("button_text"),
                    data.get("button_link"),
                    data.get("is_active", True),
                    data.get("display_order", 0),
                    item_id
                )
            )

            item = cur.fetchone()

            if not item:

                raise HTTPException(
                    status_code=404,
                    detail="Lookbook item not found"
                )

        conn.commit()

        return {
            "success": True,
            "item": item
        }

    except HTTPException:
        raise

    except Exception as e:

        if conn:
            conn.rollback()

        print("LOOKBOOK ITEM UPDATE ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if conn:
            conn.close()


@app.delete("/api/lookbook/item/{item_id}")
def delete_lookbook_item(item_id: int):

    conn = None

    try:

        conn = get_db_connection()

        with conn.cursor() as cur:

            cur.execute(
                """
                DELETE FROM lookbook_items
                WHERE id = %s
                RETURNING id
                """,
                (item_id,)
            )

            deleted = cur.fetchone()

            if not deleted:

                raise HTTPException(
                    status_code=404,
                    detail="Lookbook item not found"
                )

        conn.commit()

        return {
            "success": True,
            "message": "Lookbook item deleted"
        }

    except HTTPException:
        raise

    except Exception as e:

        if conn:
            conn.rollback()

        print("LOOKBOOK ITEM DELETE ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if conn:
            conn.close()


# =========================================================
# LIMITED EDITION API
# =========================================================

@app.get("/api/limited-edition")
def get_limited_edition():

    conn = None

    try:
        conn = get_db_connection()

        with conn.cursor() as cur:

            cur.execute("""
                SELECT *
                FROM limited_edition_sections
                WHERE is_active = TRUE
                ORDER BY display_order ASC, id ASC
            """)

            sections = cur.fetchall()

            cur.execute("""
                SELECT *
                FROM limited_edition_items
                WHERE is_active = TRUE
                ORDER BY display_order ASC, id ASC
            """)

            items = cur.fetchall()

            cur.execute("""
                SELECT *
                FROM limited_edition_settings
                WHERE is_active = TRUE
                ORDER BY id DESC
                LIMIT 1
            """)

            settings = cur.fetchone()

        result = []

        for section in sections:

            section_data = dict(section)

            section_data["items"] = [
                dict(item)
                for item in items
                if item["section_key"] == section["section_key"]
            ]

            result.append(section_data)

        return {
            "success": True,
            "sections": result,
            "settings": dict(settings) if settings else {
                "days": 0,
                "hours": 0,
                "minutes": 0
            }
        }

    except Exception as e:

        print(
            "LIMITED EDITION GET ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if conn:
            conn.close()


@app.put("/api/limited-edition/section/{section_key}")
def update_limited_section(
    section_key: str,
    data: dict
):

    conn = None

    try:

        conn = get_db_connection()

        with conn.cursor() as cur:

            cur.execute(
                """
                UPDATE limited_edition_sections
                SET
                    eyebrow = %s,
                    title = %s,
                    description = %s,
                    image_url = %s,
                    button_text = %s,
                    button_link = %s,
                    is_active = %s,
                    display_order = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE section_key = %s
                RETURNING *
                """,
                (
                    data.get("eyebrow"),
                    data.get("title"),
                    data.get("description"),
                    data.get("image_url"),
                    data.get("button_text"),
                    data.get("button_link"),
                    data.get("is_active", True),
                    data.get("display_order", 0),
                    section_key
                )
            )

            section = cur.fetchone()

            if not section:

                raise HTTPException(
                    status_code=404,
                    detail="Limited Edition section not found"
                )

        conn.commit()

        return {
            "success": True,
            "section": section
        }

    except HTTPException:
        raise

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "LIMITED SECTION UPDATE ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if conn:
            conn.close()


@app.post("/api/limited-edition/item")
def create_limited_item(data: dict):

    conn = None

    try:

        conn = get_db_connection()

        with conn.cursor() as cur:

            cur.execute(
                """
                INSERT INTO limited_edition_items
                (
                    section_key,
                    title,
                    description,
                    price,
                    image_url,
                    button_text,
                    button_link,
                    product_id,
                    icon_name,
                    is_active,
                    display_order
                )
                VALUES
                (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
                """,
                (
                    data.get("section_key"),
                    data.get("title"),
                    data.get("description"),
                    data.get("price"),
                    data.get("image_url"),
                    data.get("button_text"),
                    data.get("button_link"),
                    data.get("product_id"),
                    data.get("icon_name"),
                    data.get("is_active", True),
                    data.get("display_order", 0)
                )
            )

            item = cur.fetchone()

        conn.commit()

        return {
            "success": True,
            "item": item
        }

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "LIMITED ITEM CREATE ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if conn:
            conn.close()


@app.put("/api/limited-edition/item/{item_id}")
def update_limited_item(
    item_id: int,
    data: dict
):

    conn = None

    try:

        conn = get_db_connection()

        with conn.cursor() as cur:

            cur.execute(
                """
                UPDATE limited_edition_items
                SET
                    section_key = %s,
                    title = %s,
                    description = %s,
                    price = %s,
                    image_url = %s,
                    button_text = %s,
                    button_link = %s,
                    product_id = %s,
                    icon_name = %s,
                    is_active = %s,
                    display_order = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING *
                """,
                (
                    data.get("section_key"),
                    data.get("title"),
                    data.get("description"),
                    data.get("price"),
                    data.get("image_url"),
                    data.get("button_text"),
                    data.get("button_link"),
                    data.get("product_id"),
                    data.get("icon_name"),
                    data.get("is_active", True),
                    data.get("display_order", 0),
                    item_id
                )
            )

            item = cur.fetchone()

            if not item:

                raise HTTPException(
                    status_code=404,
                    detail="Limited Edition item not found"
                )

        conn.commit()

        return {
            "success": True,
            "item": item
        }

    except HTTPException:
        raise

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "LIMITED ITEM UPDATE ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if conn:
            conn.close()


@app.delete("/api/limited-edition/item/{item_id}")
def delete_limited_item(item_id: int):

    conn = None

    try:

        conn = get_db_connection()

        with conn.cursor() as cur:

            cur.execute(
                """
                DELETE FROM limited_edition_items
                WHERE id = %s
                RETURNING id
                """,
                (item_id,)
            )

            deleted = cur.fetchone()

            if not deleted:

                raise HTTPException(
                    status_code=404,
                    detail="Limited Edition item not found"
                )

        conn.commit()

        return {
            "success": True,
            "message": "Limited Edition item deleted"
        }

    except HTTPException:
        raise

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "LIMITED ITEM DELETE ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if conn:
            conn.close()


@app.put("/api/limited-edition/settings")
def update_limited_settings(data: dict):

    conn = None

    try:

        conn = get_db_connection()

        with conn.cursor() as cur:

            cur.execute("""
                UPDATE limited_edition_settings
                SET
                    days = %s,
                    hours = %s,
                    minutes = %s,
                    is_active = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = (
                    SELECT id
                    FROM limited_edition_settings
                    ORDER BY id DESC
                    LIMIT 1
                )
                RETURNING *
            """, (
                int(data.get("days", 0)),
                int(data.get("hours", 0)),
                int(data.get("minutes", 0)),
                data.get("is_active", True)
            ))

            settings = cur.fetchone()

        conn.commit()

        return {
            "success": "true",
            "settings": settings
        }

    except Exception as e:

        if conn:
            conn.rollback()

        print(
            "LIMITED SETTINGS UPDATE ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if conn:
            conn.close()
