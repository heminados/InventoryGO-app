import bcrypt from 'bcrypt';
import prisma from './config/prisma.js';

const fixPassword = async () => {
    const plainPassword = '1862';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await prisma.user.update({
        where: { email: 'halayadir@gmail.com' },
        data: { password: hashedPassword },
    });

    console.log('Password updated successfully');
    await prisma.$disconnect();
    process.exit();
};

fixPassword();
