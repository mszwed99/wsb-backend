import { ForbiddenException, Injectable } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { verifyData } from './handlers';
import { Role } from 'src/users/entities';

@Injectable()
export class AuthService {

    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService
    ) {}

    async singUp(dto: SignUpDto): Promise<Tokens> {
        const user = await this.usersService.create(dto)

        // Check if user wants to be a seller
        const roles: Role[] = [ Role.Customer ];
        if(dto.isSeller) roles.push(Role.Seller)

        await this.usersService.grantRoles(user.id, roles)
        const tokens = await this.generateTokens(user.id, user.email, roles)
        await this.usersService.updateRtHash(user.id, tokens.refresh_token)
        return tokens
    }

    async signIn(dto: SignInDto): Promise<Tokens> {
        const user = await this.usersService.findByEmail(dto.email)
        if (!user) throw new ForbiddenException('Access Denied')
        const passwordMatches = await verifyData(user.password, dto.password)
        if (!passwordMatches) throw new ForbiddenException('Access Denied')

        const roles = await this.usersService.getRoles(user.id)
        const tokens = await this.generateTokens(user.id, user.email, roles)

        await this.usersService.updateRtHash(user.id, tokens.refresh_token)    
        return tokens
    }

    async refreshTokens(userId: number, rt: string): Promise<Tokens> {
        const user = await this.usersService.findById(userId)
        if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied')
        const rtMatches = await verifyData(user.hashedRt, rt)
        if (!rtMatches) throw new ForbiddenException('Access Denied');

        const roles = await this.usersService.getRoles(user.id)
        const tokens = await this.generateTokens(user.id, user.email, roles)

        await this.usersService.updateRtHash(user.id, tokens.refresh_token)
        return tokens
    }

    async logout(userId: number): Promise<void> {
        const user = await this.usersService.findById(userId)
        if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied')
        await this.usersService.updateRtHash(user.id, null)
    }


    // Handle functions 
    async generateTokens(userId: number, email: string, roles: Role[]): Promise<Tokens> {
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync({
                sub: userId,
                email,
                roles
            }, {
                secret: process.env.AT_SECRET,
                expiresIn: 60 * 15
            }),
            this.jwtService.signAsync({
                sub: userId,
                email,
                roles
            }, {
                secret: process.env.RT_SECRET,
                expiresIn: 60 * 60 * 24 * 7
            })
        ])

        return { access_token: at, refresh_token: rt }
    }
}
