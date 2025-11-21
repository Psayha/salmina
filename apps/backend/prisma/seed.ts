/**
 * @file seed.ts
 * @description Database seed script for Telegram Shop
 * @author AI Assistant
 * @created 2024-11-13
 */

import { PrismaClient, UserRole, LegalDocumentType } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting database seeding...');

  // Clean existing data (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🗑️  Cleaning existing data...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.wishlistShare.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.promocode.deleteMany();
    await prisma.promotion.deleteMany();
    await prisma.legalDocument.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create or update admin user
  console.log('👤 Creating/updating admin user...');
  const adminUser = await prisma.user.upsert({
    where: { telegramId: BigInt('887567962') },
    update: {
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      role: UserRole.ADMIN,
    },
    create: {
      telegramId: BigInt('887567962'),
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      role: UserRole.ADMIN,
      hasAcceptedTerms: true,
      termsAcceptedAt: new Date(),
    },
  });
  console.log(`✅ Admin user created: ${adminUser.username}`);

  // Create test user
  console.log('👤 Creating test user...');
  const testUser = await prisma.user.create({
    data: {
      telegramId: BigInt(987654321),
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      phone: '+79001234567',
      email: 'test@example.com',
      hasAcceptedTerms: true,
      termsAcceptedAt: new Date(),
    },
  });
  console.log(`✅ Test user created: ${testUser.username}`);

  // Create categories
  console.log('📁 Creating categories...');
  const skincare = await prisma.category.create({
    data: {
      name: 'Уход за кожей',
      slug: 'skincare',
      description: 'Профессиональный уход за кожей лица и тела',
      order: 1,
      showOnHome: true,
      homeOrder: 1,
      image: '/images/categories/skincare.jpg',
    },
  });

  const makeup = await prisma.category.create({
    data: {
      name: 'Макияж',
      slug: 'makeup',
      description: 'Декоративная косметика для безупречного образа',
      order: 2,
      showOnHome: true,
      homeOrder: 2,
      image: '/images/categories/makeup.jpg',
    },
  });

  const haircare = await prisma.category.create({
    data: {
      name: 'Уход за волосами',
      slug: 'haircare',
      description: 'Профессиональный уход за волосами',
      order: 3,
      showOnHome: true,
      homeOrder: 3,
      image: '/images/categories/haircare.jpg',
    },
  });

  // Create subcategories
  const faceCare = await prisma.category.create({
    data: {
      name: 'Уход за лицом',
      slug: 'face-care',
      description: 'Кремы, сыворотки, маски для лица',
      parentId: skincare.id,
      order: 1,
    },
  });

  const bodyCare = await prisma.category.create({
    data: {
      name: 'Уход за телом',
      slug: 'body-care',
      description: 'Кремы, лосьоны, скрабы для тела',
      parentId: skincare.id,
      order: 2,
    },
  });

  console.log('✅ Categories created');

  // Create products
  console.log('📦 Creating products...');
  const products = [
    {
      categoryId: faceCare.id,
      name: 'Увлажняющий крем для лица',
      slug: 'moisturizing-face-cream',
      description: 'Интенсивное увлажнение на 24 часа. Подходит для всех типов кожи.',
      price: 1299,
      promotionPrice: 899,
      article: 'SKC-001',
      sku: 'SKC001',
      weight: 50,
      quantity: 15,
      composition: 'Гиалуроновая кислота, витамин E, пантенол',
      delivery: 'СДЭК, Почта России',
      application: 'Наносить на очищенную кожу лица утром и вечером',
      images: ['/images/products/cream-1.jpg'],
      isNew: true,
      isHit: true,
      hasPromotion: true,
      viewCount: 150,
      orderCount: 45,
    },
    {
      categoryId: faceCare.id,
      name: 'Антивозрастная сыворотка',
      slug: 'anti-age-serum',
      description: 'Борьба с первыми признаками старения. Лифтинг-эффект.',
      price: 2499,
      discountPrice: 1999,
      article: 'SER-002',
      sku: 'SER002',
      weight: 30,
      quantity: 8,
      composition: 'Ретинол, пептиды, витамин C',
      delivery: 'СДЭК, Почта России',
      application: 'Наносить вечером на очищенную кожу',
      images: ['/images/products/serum-1.jpg'],
      isNew: false,
      isHit: true,
      isDiscount: true,
      viewCount: 200,
      orderCount: 67,
    },
    {
      categoryId: bodyCare.id,
      name: 'Питательный крем для тела',
      slug: 'body-cream',
      description: 'Глубокое питание и увлажнение кожи тела.',
      price: 899,
      article: 'BDY-003',
      sku: 'BDY003',
      weight: 200,
      quantity: 25,
      composition: 'Масло ши, алоэ вера, витамин B5',
      delivery: 'СДЭК, Почта России',
      application: 'Наносить на чистую кожу после душа',
      images: ['/images/products/body-cream-1.jpg'],
      isNew: true,
      isHit: false,
      viewCount: 89,
      orderCount: 23,
    },
    {
      categoryId: makeup.id,
      name: 'Тональный крем',
      slug: 'foundation',
      description: 'Безупречное покрытие на весь день. SPF 15.',
      price: 1599,
      article: 'MKP-004',
      sku: 'MKP004',
      weight: 30,
      quantity: 0, // Out of stock
      composition: 'Минеральные пигменты, витамин E, SPF 15',
      delivery: 'СДЭК, Почта России',
      application: 'Наносить на увлажненную кожу лица',
      images: ['/images/products/foundation-1.jpg'],
      isNew: false,
      isHit: false,
      viewCount: 120,
      orderCount: 34,
    },
  ];

  for (const productData of products) {
    await prisma.product.create({
      data: productData,
    });
  }
  console.log(`✅ ${products.length} products created`);

  // Create promotions
  console.log('🎉 Creating promotions...');
  await prisma.promotion.create({
    data: {
      title: 'Скидка 30% на уход за кожей',
      description: 'Специальное предложение на весь ассортимент средств для ухода за кожей',
      image: '/images/promotions/promo-1.jpg',
      link: '/catalog/skincare',
      order: 1,
      validFrom: new Date('2024-11-01'),
      validTo: new Date('2024-11-30'),
    },
  });

  await prisma.promotion.create({
    data: {
      title: 'Новинки в макияже',
      description: 'Откройте для себя новую коллекцию декоративной косметики',
      image: '/images/promotions/promo-2.jpg',
      link: '/catalog/makeup',
      order: 2,
      validFrom: new Date('2024-11-01'),
      validTo: new Date('2024-12-31'),
    },
  });
  console.log('✅ Promotions created');

  // Create promocodes
  console.log('🎫 Creating promocodes...');
  await prisma.promocode.create({
    data: {
      code: 'WELCOME10',
      discountType: 'PERCENT',
      discountValue: 10,
      minOrderAmount: 1000,
      maxUses: 100,
      validFrom: new Date('2024-11-01'),
      validTo: new Date('2024-12-31'),
    },
  });

  await prisma.promocode.create({
    data: {
      code: 'SALE500',
      discountType: 'FIXED',
      discountValue: 500,
      minOrderAmount: 2000,
      maxUses: 50,
      validFrom: new Date('2024-11-01'),
      validTo: new Date('2024-11-30'),
    },
  });
  console.log('✅ Promocodes created');

  // Create legal documents
  console.log('📄 Creating legal documents...');
  await prisma.legalDocument.create({
    data: {
      type: LegalDocumentType.TERMS,
      title: 'Условия использования',
      content: '<h1>Условия использования</h1><p>Здесь будет текст условий использования...</p>',
      version: '1.0',
      isActive: true,
      publishedAt: new Date(),
    },
  });

  await prisma.legalDocument.create({
    data: {
      type: LegalDocumentType.PRIVACY,
      title: 'Политика конфиденциальности',
      content: '<h1>Политика конфиденциальности</h1><p>Здесь будет текст политики...</p>',
      version: '1.0',
      isActive: true,
      publishedAt: new Date(),
    },
  });

  await prisma.legalDocument.create({
    data: {
      type: LegalDocumentType.OFFER,
      title: 'Публичная оферта',
      content: '<h1>Публичная оферта</h1><p>Здесь будет текст оферты...</p>',
      version: '1.0',
      isActive: true,
      publishedAt: new Date(),
    },
  });

  await prisma.legalDocument.create({
    data: {
      type: LegalDocumentType.DELIVERY_PAYMENT,
      title: 'Доставка и оплата',
      content: `
        <h1>Доставка и оплата</h1>
        <h2>Доставка</h2>
        <p>Доставка осуществляется через СДЭК и Почту России.</p>
        <h2>Оплата</h2>
        <p>Оплата картой через СБП или при получении.</p>
      `,
      version: '1.0',
      isActive: true,
      publishedAt: new Date(),
    },
  });
  console.log('✅ Legal documents created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
