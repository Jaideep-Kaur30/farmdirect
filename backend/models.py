from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default="consumer")  # farmer | consumer | admin
    phone = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255))
    pincode = db.Column(db.String(20))
    address = db.Column(db.Text)
    avatar_url = db.Column(db.String(512))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "role": self.role,
            "phone": self.phone,
            "location": self.location,
            "pincode": self.pincode,
            "address": self.address,
            "avatar_url": self.avatar_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    farmer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    crop_name = db.Column(db.String(255), nullable=False)
    crop_name_hi = db.Column(db.String(255))
    category = db.Column(db.String(64), nullable=False)  # vegetable | fruit | grain | dairy | other
    quantity_available = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(50), default="kg")  # kg | quintal | dozen | litre
    price_per_unit = db.Column(db.Float, nullable=False)
    mandi_reference_price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(512))
    harvest_date = db.Column(db.String(64))
    description = db.Column(db.Text)
    description_hi = db.Column(db.Text)
    status = db.Column(db.String(50), default="active")  # active | sold_out | removed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    farmer = db.relationship("User", backref="products")

    def to_dict(self):
        savings_pct = (
            round(((self.mandi_reference_price - self.price_per_unit) / self.mandi_reference_price) * 100)
            if self.mandi_reference_price > 0
            else 0
        )
        return {
            "id": self.id,
            "farmer_id": self.farmer_id,
            "crop_name": self.crop_name,
            "crop_name_hi": self.crop_name_hi or self.crop_name,
            "category": self.category,
            "quantity_available": self.quantity_available,
            "unit": self.unit,
            "price_per_unit": self.price_per_unit,
            "mandi_reference_price": self.mandi_reference_price,
            "image_url": self.image_url,
            "harvest_date": self.harvest_date,
            "description": self.description,
            "description_hi": self.description_hi or self.description,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "farmer": {
                "id": self.farmer.id,
                "name": self.farmer.name,
                "location": self.farmer.location,
                "phone": self.farmer.phone,
                "avatarUrl": self.farmer.avatar_url,
            }
            if self.farmer
            else None,
            "fair_price": {
                "badgeType": "BEST_VALUE" if savings_pct >= 15 else "FAIR_PRICE",
                "savingsPercentage": max(0, savings_pct),
                "savingsRupees": max(0, round(self.mandi_reference_price - self.price_per_unit, 1)),
            },
        }


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"))
    consumer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    farmer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    quantity_ordered = db.Column(db.Float, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    middleman_savings = db.Column(db.Float, default=0.0)
    delivery_address = db.Column(db.Text)
    status = db.Column(
        db.String(50), default="pending"
    )  # pending | confirmed | ready | completed | cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = db.relationship("Product")
    consumer = db.relationship("User", foreign_keys=[consumer_id])
    farmer = db.relationship("User", foreign_keys=[farmer_id])

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "consumer_id": self.consumer_id,
            "farmer_id": self.farmer_id,
            "quantity_ordered": self.quantity_ordered,
            "unit_price": self.unit_price,
            "total_price": self.total_price,
            "middleman_savings": self.middleman_savings,
            "delivery_address": self.delivery_address,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "crop_name": self.product.crop_name if self.product else "Direct Produce",
            "unit": self.product.unit if self.product else "kg",
            "image_url": self.product.image_url if self.product else "/images/tomatoes.jpg",
            "farmer": {
                "name": self.farmer.name if self.farmer else "Farmer",
                "phone": self.farmer.phone if self.farmer else "",
                "location": self.farmer.location if self.farmer else "",
            },
            "consumer": {
                "name": self.consumer.name if self.consumer else "Consumer",
                "phone": self.consumer.phone if self.consumer else "",
                "location": self.consumer.location if self.consumer else "",
            },
        }


class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"))
    farmer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    consumer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1 to 5
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    consumer = db.relationship("User", foreign_keys=[consumer_id])

    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "farmer_id": self.farmer_id,
            "consumer_id": self.consumer_id,
            "rating": self.rating,
            "comment": self.comment,
            "consumer_name": self.consumer.name if self.consumer else "Verified Consumer",
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class MandiPriceHistory(db.Model):
    __tablename__ = "mandi_price_history"

    id = db.Column(db.Integer, primary_key=True)
    crop_name = db.Column(db.String(255), nullable=False)
    day_label = db.Column(db.String(64), nullable=False)
    mandi_price = db.Column(db.Float, nullable=False)
    farmdirect_price = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "cropName": self.crop_name,
            "dayLabel": self.day_label,
            "mandiPrice": self.mandi_price,
            "farmDirectPrice": self.farmdirect_price,
        }
