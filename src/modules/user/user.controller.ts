import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
  Param,
  Post,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiBody,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '@app/types/authenticated.request';
import { UserService } from './user.service';
import { UpdateUserInfoDto } from './dto/updateUserInfo.dto';
import { BookingsService } from '@app/modules/bookings/bookings.service';
import { UserBookingResponseDto } from '@app/modules/bookings/dto/user-booking-response.dto';
import { PaymentsService } from '@app/modules/payments/payments.service';
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly usersService: UserService,
    private readonly bookingsService: BookingsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Patch()
  @ApiOperation({ summary: 'Update user profile info' })
  @ApiConsumes('application/json')
  @ApiBody({
    description: 'Update user info',
    type: UpdateUserInfoDto,
    examples: {
      example1: {
        summary: 'Example payload',
        value: {
          firstPersonName: 'Іван',
          firstPersonSurname: 'Іванов',
          secondPersonName: 'Марія',
          secondPersonSurname: 'Петренко',
          phone: '+380501234567',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  updateUser(
    @Body() updateUserInfoDto: UpdateUserInfoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.updateUser(req.user.id, updateUserInfoDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user info (based on JWT)' })
  @ApiResponse({ status: 200, description: 'Returns user entity' })
  getMe(@Req() req: AuthenticatedRequest) {
    return this.usersService.getById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'List of user bookings',
    type: [UserBookingResponseDto],
  })
  @Get('bookings')
  getUserBookings(@Req() req: AuthenticatedRequest) {
    return this.bookingsService.getBookingsByUser(req.user.id);
  }
  @Get('bookings/:id')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'User booking details',
    type: UserBookingResponseDto,
  })
  getUserBooking(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    console.log('REQ.USER', req.user); // перевірка, чи є user
    const bookingId = Number(id);
    if (isNaN(bookingId)) throw new BadRequestException('Invalid booking ID');
    return this.bookingsService.getBookingByUser(req.user.id, bookingId);
  }
  @UseGuards(JwtAuthGuard)
  @Post('bookings/:id/retry-payment')
  @ApiOperation({ summary: 'Retry payment for pending booking' })
  @ApiResponse({
    status: 200,
    description: 'Returns payment link for retry',
    schema: {
      example: {
        paymentLink: 'https://checkout.stripe.com/...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Booking is not in pending_payment status',
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
  })
  async retryBookingPayment(
    @Param('id') bookingId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentsService.createPaymentForBooking(
      req.user.id,
      Number(bookingId),
    );
  }
}
