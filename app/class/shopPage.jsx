import { Award, Coins, Image as ImageIcon, Palette, Plus, Sparkles, Star } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const cosmeticsData = [
    {
        id: 1,
        name: 'Ocean Wave Theme',
        coins: 250,
        category: 'Theme',
        icon: 'Palette',
        color: '#3b82f6',
        rarity: 'Epic',
    },
    {
        id: 2,
        name: 'Golden Star Badge',
        coins: 500,
        category: 'Badge',
        icon: 'Award',
        color: '#fbbf24',
        rarity: 'Legendary',
    },
    {
        id: 3,
        name: 'Neon Avatar Frame',
        coins: 180,
        category: 'Frame',
        icon: 'ImageIcon',
        color: '#8b5cf6',
        rarity: 'Rare',
    },
    {
        id: 4,
        name: 'Forest Green Theme',
        coins: 220,
        category: 'Theme',
        icon: 'Palette',
        color: '#10b981',
        rarity: 'Epic',
    },
    {
        id: 5,
        name: 'Achievement Hunter',
        coins: 350,
        category: 'Badge',
        icon: 'Award',
        color: '#ef4444',
        rarity: 'Epic',
    },
    {
        id: 6,
        name: 'Sparkle Effect',
        coins: 150,
        category: 'Effect',
        icon: 'Sparkles',
        color: '#f472b6',
        rarity: 'Rare',
    },
    {
        id: 7,
        name: 'Sunset Theme',
        coins: 280,
        category: 'Theme',
        icon: 'Palette',
        color: '#f97316',
        rarity: 'Epic',
    },
    {
        id: 8,
        name: 'Diamond Frame',
        coins: 600,
        category: 'Frame',
        icon: 'ImageIcon',
        color: '#06b6d4',
        rarity: 'Legendary',
    },
    {
        id: 9,
        name: 'Top Scholar Badge',
        coins: 450,
        category: 'Badge',
        icon: 'Award',
        color: '#a855f7',
        rarity: 'Legendary',
    },
    {
        id: 10,
        name: 'Glow Effect',
        coins: 120,
        category: 'Effect',
        icon: 'Sparkles',
        color: '#fbbf24',
        rarity: 'Common',
    },
];

export default function ShopPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [ownedItems, setOwnedItems] = useState([]);
    const [coinBalance, setCoinBalance] = useState(1250); // Starting coins

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const categories = ['All', 'Theme', 'Badge', 'Frame', 'Effect'];

    const filteredProducts = selectedCategory === 'All'
        ? cosmeticsData
        : cosmeticsData.filter(item => item.category === selectedCategory);

    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'Common': return '#64748b';
            case 'Rare': return '#3b82f6';
            case 'Epic': return '#a855f7';
            case 'Legendary': return '#fbbf24';
            default: return '#64748b';
        }
    };

    const getIconComponent = (iconName) => {
        switch (iconName) {
            case 'Palette': return Palette;
            case 'Award': return Award;
            case 'ImageIcon': return ImageIcon;
            case 'Sparkles': return Sparkles;
            default: return Star;
        }
    };

    const purchaseItem = (item) => {
        if (ownedItems.includes(item.id)) {
            const message = 'You already own this item!';
            Platform.OS === 'web' ? alert(message) : Alert.alert('Already Owned', message);
            return;
        }

        if (coinBalance < item.coins) {
            const message = 'Not enough coins! Complete assignments to earn more.';
            Platform.OS === 'web' ? alert(message) : Alert.alert('Insufficient Coins', message);
            return;
        }

        setCoinBalance(coinBalance - item.coins);
        setOwnedItems([...ownedItems, item.id]);

        const message = `Successfully purchased ${item.name}!`;
        Platform.OS === 'web' ? alert(message) : Alert.alert('Purchase Complete', message);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                <View>
                    <Text style={styles.headerTitle}>Cosmetics Shop</Text>
                    <Text style={styles.headerSubtitle}>Customize your profile</Text>
                </View>

                {/* Coin Balance */}
                <View style={styles.coinBalance}>
                    <Coins size={24} color="#fbbf24" />
                    <Text style={styles.coinText}>{coinBalance}</Text>
                </View>
            </Animated.View>

            {/* Categories */}
            <Animated.View
                style={[
                    {
                        opacity: fadeAnim,
                    }
                ]}
            >
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            onPress={() => setSelectedCategory(category)}
                            style={[
                                styles.categoryChip,
                                selectedCategory === category && styles.categoryChipActive
                            ]}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === category && styles.categoryTextActive
                            ]}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Animated.View>

            {/* Products Grid */}
            <ScrollView
                contentContainerStyle={styles.productsContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.productsGrid}>
                    {filteredProducts.map((item) => {
                        const IconComponent = getIconComponent(item.icon);
                        const isOwned = ownedItems.includes(item.id);

                        return (
                            <Animated.View
                                key={item.id}
                                style={[
                                    styles.productCardWrapper,
                                    {
                                        opacity: fadeAnim,
                                        transform: [{ scale: scaleAnim }]
                                    }
                                ]}
                            >
                                <View style={[styles.productCard, isOwned && styles.productCardOwned]}>
                                    <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                                        <IconComponent size={48} color={item.color} strokeWidth={1.5} />

                                        {/* Rarity Badge */}
                                        <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(item.rarity) }]}>
                                            <Star size={10} color="#ffffff" fill="#ffffff" />
                                        </View>
                                    </View>

                                    <View style={styles.productInfo}>
                                        <Text style={styles.productCategory}>{item.category}</Text>
                                        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>

                                        <View style={styles.productFooter}>
                                            <View style={styles.priceContainer}>
                                                <Coins size={16} color="#fbbf24" />
                                                <Text style={styles.productPrice}>{item.coins}</Text>
                                            </View>

                                            {isOwned ? (
                                                <View style={styles.ownedBadge}>
                                                    <Text style={styles.ownedText}>Owned</Text>
                                                </View>
                                            ) : (
                                                <TouchableOpacity
                                                    style={styles.buyButton}
                                                    onPress={() => purchaseItem(item)}
                                                >
                                                    <Plus size={18} color="#ffffff" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </Animated.View>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: '#1e293b',
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: '#334155',
    },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 4 },
    headerSubtitle: { fontSize: 14, color: '#94a3b8' },

    coinBalance: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#334155',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    coinText: { color: '#fbbf24', fontSize: 18, fontWeight: 'bold' },

    categoriesContainer: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        gap: 10,
    },
    categoryChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#334155',
        marginRight: 10,
    },
    categoryChipActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    categoryText: { color: '#94a3b8', fontWeight: '600', fontSize: 14 },
    categoryTextActive: { color: '#ffffff' },

    productsContainer: { paddingHorizontal: 24, paddingBottom: 24 },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    productCardWrapper: { width: '48%' },
    productCard: {
        backgroundColor: '#1e293b',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#334155',
    },
    productCardOwned: {
        borderColor: '#10b981',
        borderWidth: 2,
    },
    iconContainer: {
        width: '100%',
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    rarityBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    productInfo: { padding: 12 },
    productCategory: { fontSize: 11, color: '#64748b', fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' },
    productName: { fontSize: 15, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 10, lineHeight: 20 },

    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    productPrice: { fontSize: 18, fontWeight: 'bold', color: '#fbbf24' },
    buyButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
    },
    ownedBadge: {
        backgroundColor: '#065f46',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#10b981',
    },
    ownedText: { color: '#6ee7b7', fontSize: 12, fontWeight: 'bold' },
});
