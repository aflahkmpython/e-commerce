from .models import Cart, CartItem

def merge_guest_cart(user, session_key):
    """
    Finds the guest cart by session key, moves its items into the user's cart,
    and then deletes the guest cart.
    """
    if not session_key:
        return None

    try:
        guest_cart = Cart.objects.get(session_key=session_key, user__isnull=True)
    except Cart.DoesNotExist:
        return None

    user_cart, created = Cart.objects.get_or_create(user=user)

    for item in guest_cart.items.all():
        # Check if the item already exists in the user's cart
        user_item, item_created = CartItem.objects.get_or_create(
            cart=user_cart, 
            product=item.product,
            defaults={'quantity': item.quantity}
        )
        if not item_created:
            user_item.quantity += item.quantity
            user_item.save()

    # Delete the guest cart
    guest_cart.delete()
    return user_cart
